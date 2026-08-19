// Browser requests go through our Next.js route handler. This keeps the browser
// same-origin on Vercel and avoids relying on the backend's CORS configuration.
import type { Vendor, PortfolioItem } from "@/data/vendors";
import { pickImageForCategory } from "@/lib/images";

const API_BASE_URL = "/api/backend";

// Hard cap on how long any API request waits before failing fast with a clear
// message instead of hanging the UI (e.g. on a slow or sleeping backend).
const REQUEST_TIMEOUT_MS = 30000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

export type ApiError = {
  message?: string;
  errors?: Array<{
    msg: string;
    path?: string;
    value?: unknown;
  }>;
};

export type ApiResult<T> = {
  data: T | null;
  error: string | null;
  statusCode?: number;
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "PLANNER" | "VENDOR" | string;
  provider?: string | null;
  providerId?: string | null;
  avatar?: string | null;
  isVerified?: boolean;
  isActive?: boolean;
  termsAcceptedAt?: string | null;
  lastLogin?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type VendorAvailability = { unavailableDates: string[] };

export type VendorProfile = {
  businessName: string;
  category: string;
  location: string;
  priceRange?: string | null;
  description?: string | null;
  availability?: VendorAvailability;
  isPublished?: boolean;
  portfolioItems?: PortfolioItem[];
};

export type BookingRequest = {
  vendorId: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  eventLocation: string;
  budget?: string;
  specialNotes?: string;
};

export type EnquiryStatus = "NEW" | "RESPONDED" | "DECLINED" | "BOOKED" | string;

export type Enquiry = {
  id: string;
  vendorId?: string;
  plannerId?: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  eventLocation: string;
  budget?: string | null;
  specialNotes?: string | null;
  status: EnquiryStatus;
  createdAt?: string;
  updatedAt?: string;
  isBookingRequest?: boolean;
  bookingRequestedAt?: string;
  bookingRespondedAt?: string | null;
  bookedAt?: string | null;
  responseMessage?: string | null;
  respondedAt?: string | null;
  isDuplicate?: boolean;
  originalEnquiryId?: string | null;
  vendorProfileId?: string;
  vendorProfile?: {
    id: string;
    businessName: string;
    category: string;
    location: string;
    profileImage?: string | null;
    averageRating?: string | number | null;
    totalReviews?: number | null;
  };
  vendor?: Pick<User, "id" | "firstName" | "lastName" | "email"> & { name?: string };
  planner?: Pick<User, "id" | "firstName" | "lastName" | "email"> & { name?: string };
  chatRoom?: { id: string } | null;
};

export type EnquiryMessage = {
  id: string;
  content: string;
  createdAt: string;
  senderId?: string;
  sender?: Pick<User, "id" | "firstName" | "lastName" | "role">;
};

export type EventStatus = "DRAFT" | "READY" | "LAUNCHED" | "COMPLETED" | "CANCELLED";

export type Event = {
  id: string;
  name: string;
  description?: string | null;
  eventType: string;
  eventDate: string;
  location: string;
  guestCount: number;
  plannerId: string;
  status: EventStatus;
  readinessScore: number;
  maxifyEventId?: string | null;
  maxifyEventUrl?: string | null;
  maxifySyncedAt?: string | null;
  maxifyMode?: string;
  createdAt?: string;
  updatedAt?: string;
  planner?: Pick<User, "id" | "firstName" | "lastName" | "email">;
  eventVendors?: EventVendor[];
  tickets?: Ticket[];
  analytics?: EventAnalytics;
};

export type EventVendorStatus = "INVITED" | "CONFIRMED" | "DECLINED";

export type EventVendor = {
  id: string;
  eventId: string;
  vendorId: string;
  enquiryId?: string | null;
  status: EventVendorStatus;
  role?: string | null;
  createdAt?: string;
  vendor?: Pick<User, "id" | "firstName" | "lastName" | "email">;
};

export type TicketStatus = "ACTIVE" | "USED" | "CANCELLED";

export type Ticket = {
  id: string;
  eventId: string;
  attendeeId?: string | null;
  ticketType: string;
  ticketCode: string;
  status: TicketStatus;
  purchaserName: string;
  purchaserEmail: string;
  purchaseDate?: string;
  checkedInAt?: string | null;
};

export type EventAnalytics = {
  id: string;
  eventId: string;
  totalTickets: number;
  totalCheckedIn: number;
  attendanceRate: number;
  generatedAt?: string;
};

export type EventReadiness = {
  score: number;
  status: string;
  checks: Array<{
    name: string;
    passed: boolean;
    points: number;
    message?: string;
  }>;
  isReady: boolean;
};

export type MaxifyIntegrationInfo = {
  mode: string;
  isDemo: boolean;
  isProduction: boolean;
  providerName: string;
  description: string;
  event: {
    id: string;
    name: string;
    status: EventStatus;
    maxifyEventId?: string | null;
    maxifyEventUrl?: string | null;
    maxifySyncedAt?: string | null;
    maxifyMode?: string;
  };
};

export type TicketStats = {
  eventId: string;
  ticketTypes: Array<{
    id: string;
    name: string;
    price: number;
    currency: string;
    totalSold: number;
    maxCapacity: number;
    revenue: number;
    percentageSold: number;
  }>;
  totalSold: number;
  totalRevenue: number;
  totalCapacity: number;
  percentageSold: number;
};

export type GuestStats = {
  eventId: string;
  expectedGuests: number;
  registered: number;
  checkedIn: number;
  notCheckedIn: number;
  attendanceRate: number;
};

export type AttendanceData = {
  eventId: string;
  summary: {
    registered: number;
    checkedIn: number;
    notCheckedIn: number;
    attendanceRate: number;
  };
  byTicketType: {
    Regular: { total: number; checkedIn: number };
    VIP: { total: number; checkedIn: number };
  };
  recentCheckIns: Array<{
    id: string;
    name: string;
    ticketType: string;
    checkedInAt: string;
  }>;
};

async function apiRequest<T>(path: string, init: RequestInit = {}, options: { skipAuthRedirect?: boolean } = {}): Promise<ApiResult<T>> {
  const headers = (init.body instanceof FormData)
    ? (init.headers ?? {})
    : ({ "Content-Type": "application/json", ...(init.headers ?? {}) });

  const attemptFetch = async (signal?: AbortSignal) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers,
        credentials: (init.credentials ?? "include"),
        signal: signal ?? controller.signal,
      });
      clearTimeout(timeout);
      return response;
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  };

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await attemptFetch();
      const text = await response.text();
      let json: unknown = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }

      if (!response.ok) {
        let message = response.statusText || "Request failed";

        if (typeof json === "object" && json !== null) {
          const body = json as Record<string, unknown>;
          if (body.message) {
            message = String(body.message);
          } else if (Array.isArray(body.errors) && body.errors.length > 0) {
            message = body.errors
              .map((error) => {
                if (typeof error === "string") return error;
                if (typeof error === "object" && error !== null) {
                  const details = error as Record<string, unknown>;
                  if (details.msg && details.path) return `${details.path}: ${details.msg}`;
                  if (details.msg) return String(details.msg);
                }
                return JSON.stringify(error);
              })
              .join(". ");
          }
        }

        if (response.status >= 500 && attempt < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)));
          continue;
        }

        if (response.status >= 500) {
          console.error(`API error ${response.status}: ${message}`, { status: response.status, body: json });
        }

        if (response.status === 401 && !options.skipAuthRedirect) {
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[auth] apiRequest 401 on ${path} — attempting token refresh`, { method: init.method, path });
          }
          const refreshed = await refreshToken();
          if (refreshed) {
            if (process.env.NODE_ENV !== 'production') {
              console.log(`[auth] token refreshed, retrying ${path}`);
            }
            const retryHeaders = (init.body instanceof FormData)
              ? (init.headers ?? {})
              : ({ "Content-Type": "application/json", ...(init.headers ?? {}) });
            const retryAuth = getAuthHeaders();
            if (retryAuth.Authorization) Object.assign(retryHeaders, retryAuth);
            const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
              ...init,
              headers: retryHeaders,
              credentials: (init.credentials ?? "include"),
              signal: new AbortController().signal,
            });
            const retryText = await retryResponse.text();
            let retryJson: unknown = null;
            try {
              retryJson = retryText ? JSON.parse(retryText) : null;
            } catch {
              retryJson = null;
            }
            if (retryResponse.ok) {
              return { data: retryJson as T, error: null };
            }
            let retryMessage = retryResponse.statusText || "Request failed after refresh";
            if (typeof retryJson === "object" && retryJson !== null) {
              const body = retryJson as Record<string, unknown>;
              if (body.message) retryMessage = String(body.message);
            }
            if (retryResponse.status === 401) {
              clearAuth();
              if (typeof window !== "undefined") {
                window.location.href = "/signin";
              }
            }
            return { data: null, error: retryMessage, statusCode: retryResponse.status };
          }
          clearAuth();
          if (typeof window !== "undefined") {
            window.location.href = "/signin";
          }
          return { data: null, error: message, statusCode: 401 };
        } else if (response.status === 401 && options.skipAuthRedirect) {
          return { data: null, error: message, statusCode: 401 };
        } else if (response.status === 403) {
          const bodyMessage = typeof json === "object" && json !== null ? String((json as Record<string, unknown>).message ?? "") : "";
          if (bodyMessage.toLowerCase().includes("verify your email")) {
            clearAuth();
            if (typeof window !== "undefined") {
              window.location.href = "/signin?verify=1";
            }
            return { data: null, error: "Please verify your email before continuing.", statusCode: 403 };
          }
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[auth] apiRequest 403 on ${path}`, { method: init.method, path, body: json });
          }
          return { data: null, error: message, statusCode: 403 };
        }

        return { data: null, error: message, statusCode: response.status };
      }

      return { data: json as T, error: null };
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)));
        continue;
      }
      if (err instanceof Error && err.name === "AbortError") {
        return {
          data: null,
          error: "The request took too long. Please check your connection and try again.",
          statusCode: 408,
        };
      }
      return {
        data: null,
        error: "Unable to reach the server. Please try again in a moment.",
      };
    }
  }

  return {
    data: null,
    error: lastError instanceof Error ? lastError.message : "Unable to reach the server. Please try again in a moment.",
  };
}

export interface RefreshResult {
  token: string;
  user: User;
}

let refreshPromise: Promise<RefreshResult | null> | null = null;

export async function refreshToken(): Promise<RefreshResult | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[auth] attempting token refresh');
    }
    try {
      const currentToken = getAuthToken();
      const refreshHeaders: Record<string, string> = { "Content-Type": "application/json" };
      if (currentToken) {
        refreshHeaders.Authorization = `Bearer ${currentToken}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: refreshHeaders,
        body: currentToken ? JSON.stringify({ token: currentToken }) : undefined,
      });

      if (!response.ok) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[auth] token refresh failed', { status: response.status });
        }
        return null;
      }

      const text = await response.text();
      const body = text ? JSON.parse(text) : null;
      const data = body?.data ?? body;
      const token = body?.token ?? data?.token;
      const refreshedUser = body?.user ?? data?.user ?? body?.user ?? data?.data?.user;

      if (token) {
        saveAuthToken(token, true);
        let freshUser = getAuthUser();
        if (refreshedUser) {
          freshUser = refreshedUser as User;
          saveAuthUser(freshUser, true);
        } else {
          const me = await apiRequest<User>("/api/auth/me", { method: "GET", headers: { Authorization: `Bearer ${token}` } });
          if (!me.error && me.data) {
            freshUser = me.data;
            saveAuthUser(freshUser, true);
          }
        }
        if (process.env.NODE_ENV !== 'production') {
          console.log('[auth] token refresh successful', { role: freshUser?.role });
        }
        return { token, user: freshUser as User };
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log('[auth] token refresh response missing token', { bodyKeys: Object.keys(body || {}) });
      }
      return null;
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[auth] token refresh error', { error: String((err as Error)?.message ?? err) });
      }
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export const GOOGLE_AUTH_URL =
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL ??
  `${API_BASE_URL}/api/auth/google`;

export const USER_STORAGE_KEY = "eventconnect_user";
export const TOKEN_STORAGE_KEY = "eventconnect_token";

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }
  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
  if (process.env.NODE_ENV !== 'production') {
    console.log('[auth] getAuthToken', { hasToken: !!token, storage: token ? (window.localStorage.getItem(TOKEN_STORAGE_KEY) ? 'localStorage' : 'sessionStorage') : 'none' });
  }
  return token;
}

export function saveAuthToken(token: string, remember = true) {
  if (typeof window === "undefined") {
    return;
  }

  if (remember) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('[auth] token saved', { storage: remember ? 'localStorage' : 'sessionStorage', tokenLength: token.length });
  }
}

export function saveAuthUser(user: User, remember = true) {
  if (typeof window === "undefined") {
    return;
  }

  if (remember) {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    window.sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('[auth] user saved', { storage: remember ? 'localStorage' : 'sessionStorage', role: user.role, email: user.email });
  }
}

function decodeBase64Utf8(base64: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function getAuthUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored =
    window.localStorage.getItem(USER_STORAGE_KEY) ??
    window.sessionStorage.getItem(USER_STORAGE_KEY);
  if (stored) {
    try {
      const user = JSON.parse(stored) as Partial<User>;
      if (!user?.id || typeof user.role !== "string" || user.role.trim() === "") {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[auth] getAuthUser storage rejected invalid user', { role: user?.role });
        }
        return null;
      }
      const validUser = user as User;
      if (process.env.NODE_ENV !== 'production') {
        console.log('[auth] getAuthUser from storage', { role: validUser.role, email: validUser.email });
      }
      return validUser;
    } catch {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[auth] getAuthUser storage parse failed');
      }
      return null;
    }
  }

  const token = getAuthToken();
  if (!token) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[auth] getAuthUser no token');
    }
    return null;
  }

  const payload = token.split(".")[1];
  if (!payload) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[auth] getAuthUser no payload');
    }
    return null;
  }

  try {
    const decoded = JSON.parse(decodeBase64Utf8(payload));
    if (!decoded?.id || typeof decoded.role !== "string" || decoded.role.trim() === "") {
      return null;
    }
    const user = {
      id: decoded.id,
      email: decoded.email ?? "",
      firstName: decoded.firstName ?? "",
      lastName: decoded.lastName ?? "",
      role: decoded.role,
    } as User;
    if (process.env.NODE_ENV !== 'production') {
      console.log('[auth] getAuthUser from token', { role: user.role, email: user.email });
    }
    return user;
  } catch {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[auth] getAuthUser token decode failed');
    }
    return null;
  }
}

export function clearAuth() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(USER_STORAGE_KEY);
  window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  window.sessionStorage.removeItem(USER_STORAGE_KEY);
  if (process.env.NODE_ENV !== 'production') {
    console.log('[auth] clearAuth called');
  }
}

export async function logout() {
  try {
    await apiRequest<void>("/api/auth/logout", { method: "POST", credentials: "include" });
  } catch {
    // ignore logout errors, clear local state anyway
  } finally {
    clearAuth();
  }
}

export async function login(email: string, password: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[auth] login request', { email });
  }
  const result = await apiRequest<{ success: boolean; token?: string; message?: string; data?: User }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }, { skipAuthRedirect: true });
  if (process.env.NODE_ENV !== 'production') {
    console.log('[auth] login response', { hasError: !!result.error, hasToken: !!result.data?.token, hasUser: !!result.data?.data });
  }
  return result;
}

export async function signup(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  accountType: "planner" | "vendor";
  termsAccepted: boolean;
}) {
  return apiRequest<{ success: boolean; token?: string; message?: string; errors?: unknown; data?: User }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  }, { skipAuthRedirect: true });
}

export async function resendVerification(email: string) {
  return apiRequest<{ success: boolean; message?: string }>("/api/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  }, { skipAuthRedirect: true });
}

export async function getVendors(token?: string) {
  const unwrap = (value: unknown): Vendor[] => {
    if (Array.isArray(value)) return value.map((vendor) => {
      const item = vendor as Record<string, unknown>;
      const user = item.user as Record<string, unknown> | undefined;
      const profile = item.profile as Record<string, unknown> | undefined;
      const firstName = String(user?.firstName ?? item.firstName ?? "");
      const lastName = String(user?.lastName ?? item.lastName ?? "");
      const accountName = [firstName, lastName].filter(Boolean).join(" ");
      return {
        id: String(user?.id ?? item.userId ?? item.id ?? ""),
        name: String(accountName || item.name || item.businessName || profile?.businessName || "Registered vendor"),
        category: String(item.category ?? profile?.category ?? "Event services"),
        location: String(item.location ?? profile?.location ?? "Location on request"),
        rating: Number(item.averageRating ?? profile?.averageRating ?? item.rating ?? 0),
        reviews: Number(item.totalReviews ?? profile?.totalReviews ?? item.reviews ?? 0),
        startingPrice: String(item.priceRange ?? profile?.priceRange ?? item.startingPrice ?? "Contact for pricing"),
        image: String(item.profileImage ?? profile?.profileImage ?? item.avatar ?? user?.avatar ?? item.image ?? pickImageForCategory(String(item.category ?? profile?.category ?? ""), String(user?.id ?? item.userId ?? item.id ?? ""))),
        description: String(item.description ?? profile?.description ?? ""),
        isPublished: Boolean(item.isPublished ?? profile?.isPublished ?? false),
        portfolioItems: (Array.isArray(item.portfolioItems) ? item.portfolioItems : []).map((pi: Record<string, unknown>) => ({
          id: String(pi.id ?? ""),
          mediaType: String(pi.mediaType ?? "IMAGE"),
          url: String(pi.url ?? ""),
          thumbnailUrl: typeof pi.thumbnailUrl === "string" ? pi.thumbnailUrl : undefined,
          caption: typeof pi.caption === "string" ? pi.caption : undefined,
          description: typeof pi.description === "string" ? pi.description : undefined,
          priceRange: typeof pi.priceRange === "string" ? pi.priceRange : undefined,
          sortOrder: Number(pi.sortOrder ?? 0),
        })) as PortfolioItem[],
      };
    }).filter((vendor): vendor is Vendor => vendor !== null && Boolean(vendor.id));
    if (!value || typeof value !== "object") return [];
    const response = value as Record<string, unknown>;
    for (const key of ["vendors", "data", "items", "results"]) {
      const vendors = unwrap(response[key]);
      if (vendors.length > 0 || Array.isArray(response[key])) return vendors;
    }
    return [];
  };

  // Use the public search endpoint first since it works for all roles
  // (planners browsing vendors, guests discovering services). The authenticated
  // `/api/vendor` endpoint is VENDOR-only and would return 403 for planners.
  const headers = getAuthHeaders(token);
  const search = await apiRequest<unknown>("/api/search/vendors", {
    method: "GET",
    headers,
  });
  if (!search.error) {
    return { data: unwrap(search.data), error: null } as ApiResult<Vendor[]>;
  }

  // Fallback for vendor-specific registered vendor data
  const registered = await apiRequest<unknown>("/api/vendor", { method: "GET", headers });
  if (!registered.error) {
    return { data: unwrap(registered.data), error: null } as ApiResult<Vendor[]>;
  }

  return { data: null, error: search.error } as ApiResult<Vendor[]>;
}

export async function getVendorAvailability(vendorId: string) {
  const result = await apiRequest<{ data?: VendorAvailability } & VendorAvailability>(`/api/search/vendors/${encodeURIComponent(vendorId)}/availability`, { method: "GET" });
  return { data: result.data?.data ?? result.data ?? null, error: result.error } as ApiResult<VendorAvailability>;
}

export async function getMyAvailability(token?: string) {
  const result = await apiRequest<{ availability?: VendorAvailability; data?: { availability?: VendorAvailability } }>("/api/vendor/profile", { method: "GET", headers: getAuthHeaders(token) });
  return { data: result.data?.availability ?? result.data?.data?.availability ?? { unavailableDates: [] }, error: result.error } as ApiResult<VendorAvailability>;
}

export async function getMyVendorProfile(token?: string) {
  const result = await apiRequest<{ success: boolean; data: VendorProfile }>("/api/vendor/profile", {
    method: "GET",
    headers: getAuthHeaders(token),
  });
  return { data: result.data?.data ?? null, error: result.error } as ApiResult<VendorProfile>;
}

export async function updateMyVendorProfile(data: Pick<VendorProfile, "businessName" | "category" | "location" | "priceRange" | "description">, token?: string) {
  const result = await apiRequest<{ success: boolean; data: VendorProfile }>("/api/vendor/profile", {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  return { data: result.data?.data ?? null, error: result.error } as ApiResult<VendorProfile>;
}

export async function updateMyAvailability(availability: VendorAvailability, token?: string) {
  return apiRequest<VendorAvailability>("/api/vendor/availability", { method: "PUT", headers: getAuthHeaders(token), body: JSON.stringify({ availability }) });
}

export async function createBooking(data: BookingRequest, token?: string) {
  const headers: Record<string, string> = {};
  const auth = getAuthHeaders(token);
  if (auth.Authorization) headers.Authorization = auth.Authorization;

  return apiRequest<{ success: boolean; message?: string; data: Enquiry }>("/api/bookings", {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
}

export async function getEnquiries(token?: string): Promise<ApiResult<Enquiry[]>> {
  const user = getAuthUser();
  const path = user?.role?.toUpperCase() === "VENDOR" ? "/api/bookings/vendor" : "/api/bookings/planner";
  const result = await apiRequest<{ success: boolean; data: { bookings: Enquiry[]; pagination?: unknown } }>(path, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
  if (result.error) {
    return { data: null, error: result.error, statusCode: result.statusCode };
  }
  const responseData = result.data as { success: boolean; data: { bookings: Enquiry[]; pagination?: unknown } } | null;
  const bookings = responseData?.data?.bookings;
  if (Array.isArray(bookings)) {
    return { data: bookings as Enquiry[], error: null };
  }
  return { data: null, error: "Unexpected response format from server.", statusCode: 500 };
}

export async function updateEnquiryStatus(
  id: string,
  status: "ACCEPTED" | "DECLINED",
  token?: string,
  responseMessage = "",
) {
  const action = status === "ACCEPTED" ? "accept" : "decline";
  return apiRequest<{ success: boolean; message?: string; data: Enquiry }>(`/api/bookings/${encodeURIComponent(id)}/${action}`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ responseMessage }),
  });
}

export async function getChatRoomMessages(roomId: string, token?: string) {
  const result = await apiRequest<{ success: boolean; data: EnquiryMessage[] }>(`/api/chat/rooms/${encodeURIComponent(roomId)}/messages`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
  return { data: result.data?.data ?? null, error: result.error } as ApiResult<EnquiryMessage[]>;
}

export async function sendChatRoomMessage(roomId: string, content: string, token?: string) {
  const result = await apiRequest<{ success: boolean; data: EnquiryMessage }>(`/api/chat/rooms/${encodeURIComponent(roomId)}/messages`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ content }),
  });
  return { data: result.data?.data ?? null, error: result.error } as ApiResult<EnquiryMessage>;
}

export async function openEnquiryChat(enquiryId: string, token?: string) {
  return apiRequest<{ success: boolean; data: { id: string; createdAt: string; updatedAt: string } }>(`/api/enquiries/${encodeURIComponent(enquiryId)}/chat`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
}

export async function getEnquiryMessages(enquiryId: string, token?: string) {
  return getChatRoomMessages(enquiryId, token);
}

export async function sendEnquiryMessage(enquiryId: string, content: string, token?: string) {
  return sendChatRoomMessage(enquiryId, content, token);
}

export function getAuthHeaders(token?: string): Record<string, string> {
  const t = token ?? getAuthToken();
  if (!t) return {};
  return { Authorization: `Bearer ${t}` };
}

export async function updateProfile(data: Partial<User>, token?: string) {
  const user = getAuthUser();
  const role = (user?.role ?? "").toUpperCase();
  const path = role === "VENDOR" ? "/api/vendor/profile" : "/api/planner/profile";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const auth = getAuthHeaders(token);
  if (auth.Authorization) headers.Authorization = auth.Authorization;

  return apiRequest<User>(path, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
}

export async function uploadProfileImage(file: File, token?: string): Promise<ApiResult<{ avatar: string }>> {
  const form = new FormData();
  form.append("image", file);

  const headers: Record<string, string> = {};
  const auth = getAuthHeaders(token);
  if (auth.Authorization) headers.Authorization = auth.Authorization;

  return apiRequest<{ avatar: string }>("/api/auth/avatar", {
    method: "POST",
    headers,
    body: form,
    credentials: "include",
  });
}

export async function getCurrentUser(token?: string, options: { skipAuthRedirect?: boolean } = {}) {
  const headers: Record<string, string> = {};
  const t = token ?? getAuthToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const result = await apiRequest<User>("/api/auth/me", {
    method: "GET",
    headers,
    credentials: "include",
  }, options);

  if (!result.error && result.data) {
    return result;
  }

  return { data: null, error: result.error ?? "Could not fetch current user" } as ApiResult<User>;
}

export async function getVendorPortfolio(vendorId: string, token?: string) {
  const headers: Record<string, string> = {};
  const t = token ?? getAuthToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  return apiRequest<{ portfolioItems: Array<{ id: string; mediaType: string; url: string; thumbnailUrl?: string; caption?: string; priceRange?: string; sortOrder: number }> }>(`/api/vendors/${vendorId}/portfolio`, {
    method: "GET",
    headers,
  });
}

export async function createPortfolioItem(formData: FormData, token?: string) {
  const headers: Record<string, string> = {};
  const auth = getAuthHeaders(token);
  if (auth.Authorization) headers.Authorization = auth.Authorization;

  const result = await apiRequest<{ success: boolean; data: { id: string; mediaType: string; url: string; thumbnailUrl?: string; caption?: string; priceRange?: string; sortOrder: number } }>("/api/vendor/portfolio", {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
  });
  return { data: result.data?.data ?? null, error: result.error } as ApiResult<{ id: string; mediaType: string; url: string; thumbnailUrl?: string; caption?: string; priceRange?: string; sortOrder: number }>;
}

export async function updatePortfolioItem(id: string, data: { caption?: string; priceRange?: string; sortOrder?: number }, token?: string) {
  const headers: Record<string, string> = {};
  const t = token ?? getAuthToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const result = await apiRequest<{ success: boolean; data: { id: string; caption?: string; priceRange?: string; sortOrder?: number } }>(`/api/vendor/portfolio/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { data: result.data?.data ?? null, error: result.error } as ApiResult<{ id: string; caption?: string; priceRange?: string; sortOrder?: number }>;
}

export async function deletePortfolioItem(id: string, token?: string) {
  const headers: Record<string, string> = {};
  const t = token ?? getAuthToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const result = await apiRequest<{ success: boolean; message?: string }>(`/api/vendor/portfolio/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers,
  });
  return { data: result.data?.success ? true : null, error: result.error } as ApiResult<boolean>;
}

// ==================== EVENT API FUNCTIONS ====================

export async function createEvent(eventData: {
  name: string;
  eventType: string;
  eventDate: string;
  location: string;
  guestCount: number;
  description?: string;
}, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const t = token ?? getAuthToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const result = await apiRequest<{ success: boolean; message?: string; data: Event }>("/api/events", {
    method: "POST",
    headers,
    body: JSON.stringify(eventData),
  });
  return { data: result.data?.data ?? null, error: result.error } as ApiResult<Event>;
}

export async function getEvents(token?: string) {
  const headers: Record<string, string> = {};
  const t = token ?? getAuthToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const result = await apiRequest<{ success: boolean; data: Event[] }>("/api/events", {
    method: "GET",
    headers,
  });
  return { data: result.data?.data ?? null, error: result.error } as ApiResult<Event[]>;
}

export async function getEvent(eventId: string, token?: string) {
  const headers: Record<string, string> = {};
  const t = token ?? getAuthToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const result = await apiRequest<{ success: boolean; data: Event }>(`/api/events/${encodeURIComponent(eventId)}`, {
    method: "GET",
    headers,
  });
  return { data: result.data?.data ?? null, error: result.error } as ApiResult<Event>;
}

export async function updateEvent(eventId: string, updateData: Partial<Event>, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const t = token ?? getAuthToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const result = await apiRequest<{ success: boolean; message?: string; data: Event }>(`/api/events/${encodeURIComponent(eventId)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(updateData),
  });
  return { data: result.data?.data ?? null, error: result.error } as ApiResult<Event>;
}

export async function addVendorToEvent(eventId: string, vendorId: string, enquiryId?: string, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const t = token ?? getAuthToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const result = await apiRequest<{ success: boolean; message?: string; data: EventVendor }>(`/api/events/${encodeURIComponent(eventId)}/vendors`, {
    method: "POST",
    headers,
    body: JSON.stringify({ vendorId, enquiryId }),
  });
  return { data: result.data?.data ?? null, error: result.error } as ApiResult<EventVendor>;
}

export async function removeVendorFromEvent(eventId: string, vendorId: string, token?: string) {
  const headers: Record<string, string> = {};
  const t = token ?? getAuthToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  return apiRequest<{ success: boolean; message?: string }>(`/api/events/${encodeURIComponent(eventId)}/vendors/${encodeURIComponent(vendorId)}`, {
    method: "DELETE",
    headers,
  });
}

export async function getEventReadiness(eventId: string, token?: string) {
  const headers: Record<string, string> = {};
  const t = token ?? getAuthToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const result = await apiRequest<{ success: boolean; data: EventReadiness }>(`/api/events/${encodeURIComponent(eventId)}/readiness`, {
    method: "GET",
    headers,
  });
  return { data: result.data?.data ?? null, error: result.error } as ApiResult<EventReadiness>;
}

export async function launchEvent(eventId: string, token?: string) {
  const headers: Record<string, string> = {};
  const t = token ?? getAuthToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const result = await apiRequest<{ success: boolean; message?: string; data: Event }>(`/api/events/${encodeURIComponent(eventId)}/launch`, {
    method: "POST",
    headers,
  });
  return { data: result.data?.data ?? null, error: result.error } as ApiResult<Event>;
}

export async function getMaxifyIntegrationInfo(eventId: string, token?: string) {
  const headers: Record<string, string> = {};
  const t = token ?? getAuthToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const result = await apiRequest<{ success: boolean; data: MaxifyIntegrationInfo }>(`/api/events/${encodeURIComponent(eventId)}/maxify/info`, {
    method: "GET",
    headers,
  });
  return { data: result.data?.data ?? null, error: result.error } as ApiResult<MaxifyIntegrationInfo>;
}

export async function getEventTickets(eventId: string, token?: string) {
  const headers: Record<string, string> = {};
  const t = token ?? getAuthToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const result = await apiRequest<{ success: boolean; data: Ticket[] }>(`/api/events/${encodeURIComponent(eventId)}/tickets`, {
    method: "GET",
    headers,
  });
  return { data: result.data?.data ?? null, error: result.error } as ApiResult<Ticket[]>;
}

export async function getTicketStats(eventId: string, token?: string) {
  const headers: Record<string, string> = {};
  const t = token ?? getAuthToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const result = await apiRequest<{ success: boolean; data: TicketStats }>(`/api/events/${encodeURIComponent(eventId)}/ticket-stats`, {
    method: "GET",
    headers,
  });
  return { data: result.data?.data ?? null, error: result.error } as ApiResult<TicketStats>;
}

export async function getAttendanceData(eventId: string, token?: string) {
  const headers: Record<string, string> = {};
  const t = token ?? getAuthToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const result = await apiRequest<{ success: boolean; data: AttendanceData }>(`/api/events/${encodeURIComponent(eventId)}/attendance`, {
    method: "GET",
    headers,
  });
  return { data: result.data?.data ?? null, error: result.error } as ApiResult<AttendanceData>;
}

export async function getEventAnalytics(eventId: string, token?: string) {
  const headers: Record<string, string> = {};
  const t = token ?? getAuthToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const result = await apiRequest<{ success: boolean; data: EventAnalytics }>(`/api/events/${encodeURIComponent(eventId)}/analytics`, {
    method: "GET",
    headers,
  });
  return { data: result.data?.data ?? null, error: result.error } as ApiResult<EventAnalytics>;
}

export async function getGuestStats(eventId: string, token?: string) {
  const headers: Record<string, string> = {};
  const t = token ?? getAuthToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const result = await apiRequest<{ success: boolean; data: GuestStats }>(`/api/events/${encodeURIComponent(eventId)}/guest-stats`, {
    method: "GET",
    headers,
  });
  return { data: result.data?.data ?? null, error: result.error } as ApiResult<GuestStats>;
}

export async function syncMaxifyEvent(eventId: string, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const t = token ?? getAuthToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const result = await apiRequest<{ success: boolean; message?: string; data: Event }>(`/api/events/${encodeURIComponent(eventId)}/maxify/sync`, {
    method: "POST",
    headers,
  });
  return { data: result.data?.data ?? null, error: result.error } as ApiResult<Event>;
}

export async function connectMaxifyEvent(eventId: string, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const t = token ?? getAuthToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const result = await apiRequest<{ success: boolean; message?: string; data: Event }>(`/api/events/${encodeURIComponent(eventId)}/maxify/connect`, {
    method: "POST",
    headers,
  });
  return { data: result.data?.data ?? null, error: result.error } as ApiResult<Event>;
}


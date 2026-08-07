// Browser requests go through our Next.js route handler. This keeps the browser
// same-origin on Vercel and avoids relying on the backend's CORS configuration.
const API_BASE_URL = "/api/backend";

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

export type Vendor = {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviews: number;
  startingPrice: string;
  image: string;
};

export type VendorAvailability = { unavailableDates: string[] };

export type VendorProfile = {
  businessName: string;
  category: string;
  location: string;
  priceRange?: string | null;
  availability?: VendorAvailability;
  isPublished?: boolean;
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

export type EnquiryStatus = "NEW" | "PENDING" | "RESPONDED" | "ACCEPTED" | "DECLINED" | "BOOKED" | string;

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

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  // Default to sending credentials (cookies) so deployments using HttpOnly cookies work.
  // Allow callers to override via `init.credentials`.
  const headers = (init.body instanceof FormData)
    ? (init.headers ?? {})
    : ({ "Content-Type": "application/json", ...(init.headers ?? {}) });

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      credentials: (init.credentials ?? "include"),
    });
  } catch {
    return {
      data: null,
      error: "Unable to reach the server. Please try again in a moment.",
    };
  }

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

    return { data: null, error: message };
  }

  return { data: json as T, error: null };
}

export const GOOGLE_AUTH_URL =
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL ??
  `${API_BASE_URL}/api/auth/google`;

const USER_STORAGE_KEY = "eventconnect_user";
const TOKEN_STORAGE_KEY = "eventconnect_token";

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
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
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  }

  const token = getAuthToken();
  if (!token) {
    return null;
  }

  const payload = token.split(".")[1];
  if (!payload) {
    return null;
  }

  try {
    const decoded = JSON.parse(atob(payload));
    return {
      id: decoded.id,
      email: decoded.email ?? "",
      firstName: decoded.firstName ?? "",
      lastName: decoded.lastName ?? "",
      role: decoded.role ?? "PLANNER",
    } as User;
  } catch {
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
}

export async function login(email: string, password: string) {
  return apiRequest<{ success: boolean; token?: string; message?: string; data?: User }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
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
  });
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
        // Enquiries belong to the vendor account, not an optional profile row.
        id: String(user?.id ?? item.userId ?? item.id ?? ""),
        // The planner directory intentionally shows the name used at signup.
        name: String(accountName || item.name || item.businessName || profile?.businessName || "Registered vendor"),
        category: String(item.category ?? profile?.category ?? "Event services"),
        location: String(item.location ?? profile?.location ?? "Location on request"),
        rating: Number(item.averageRating ?? profile?.averageRating ?? item.rating ?? 0),
        reviews: Number(item.totalReviews ?? profile?.totalReviews ?? item.reviews ?? 0),
        startingPrice: String(item.priceRange ?? profile?.priceRange ?? item.startingPrice ?? "Contact for pricing"),
        image: String(item.profileImage ?? profile?.profileImage ?? item.avatar ?? user?.avatar ?? item.image ?? ""),
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

  // `/api/vendor` is the registered-vendor collection. Keep the searchable
  // profile endpoint as a compatibility fallback for older backend deployments.
  const headers = getAuthHeaders(token);
  const registered = await apiRequest<unknown>("/api/vendor", { method: "GET", headers });
  if (!registered.error) {
    return { data: unwrap(registered.data), error: null } as ApiResult<Vendor[]>;
  }

  const search = await apiRequest<unknown>("/api/search/vendors", {
    method: "GET",
    headers,
  });
  if (search.error) return { data: null, error: registered.error } as ApiResult<Vendor[]>;

  return { data: unwrap(search.data), error: null } as ApiResult<Vendor[]>;
}

export async function getVendorAvailability(vendorId: string) {
  const result = await apiRequest<{ data?: VendorAvailability } & VendorAvailability>(`/api/search/vendors/${encodeURIComponent(vendorId)}/availability`, { method: "GET", credentials: "omit" });
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

export async function updateMyVendorProfile(data: Pick<VendorProfile, "businessName" | "category" | "location" | "priceRange">, token?: string) {
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

export async function getEnquiries(token?: string) {
  const user = getAuthUser();
  const path = user?.role?.toUpperCase() === "VENDOR" ? "/api/bookings/vendor" : "/api/bookings/planner";
  return apiRequest<{ success: boolean; data: { bookings: Enquiry[] } }>(path, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
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
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const auth = getAuthHeaders(token);
  if (auth.Authorization) headers.Authorization = auth.Authorization;

  const candidatePaths = [
    "/api/v1/profile",
    "/api/v1/users",
    "/api/v1/user",
    "/api/user",
    "/api/profile",
    "/api/auth/user",
    "/api/auth/profile",
    "/api/auth/me",
    "/api/me",
    "/api/user/me",
    "/api/profile/me",
    "/api/vendor",
    "/api/vendor/me",
    "/api/vendor/profile",
  ];
  const candidateMethods = ["PUT", "PATCH", "POST"];

  let lastErr = "";

  for (const path of candidatePaths) {
    for (const method of candidateMethods) {
      const result = await apiRequest<User>(path, {
        method,
        headers,
        body: JSON.stringify(data),
      });

      if (!result.error) {
        return result;
      }

      const lowerError = result.error.toLowerCase();
      if (
        lowerError.includes("route") ||
        lowerError.includes("not found") ||
        lowerError.includes("unsupported") ||
        lowerError.includes("cannot")
      ) {
        lastErr = `${method} ${path} -> ${result.error}`;
        continue;
      }

      return result;
    }
  }

  return {
    data: null,
    error: `Profile update route not found. Tried paths: ${candidatePaths.join(", ")}; methods: ${candidateMethods.join(", ")}. Last error: ${lastErr}`,
  };
}

export async function uploadProfileImage(file: File, token?: string) {
  void file;
  void token;
  // Image uploads are disabled in the frontend. Return a safe no-op result
  // so callers that still reference this function will not fail.
  return { data: null, error: "Profile image uploads are disabled" } as ApiResult<{ avatar: string }>;
}

export async function getCurrentUser(token?: string) {
  const headers: Record<string, string> = {};
  const t = token ?? getAuthToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const candidatePaths = [
    "/api/auth/me",
    "/api/me",
    "/api/user/me",
    "/api/user",
    "/api/auth/user",
    "/api/profile",
    "/api/v1/me",
    "/api/v1/user",
  ];

  for (const p of candidatePaths) {
    const res = await apiRequest<User>(p, { method: "GET", headers });
    if (!res.error && res.data) {
      return res;
    }
  }

  return { data: null, error: "Could not fetch current user" } as ApiResult<User>;
}

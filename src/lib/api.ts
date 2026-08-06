const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://horizon-circle.onrender.com";

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

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  // Default to sending credentials (cookies) so deployments using HttpOnly cookies work.
  // Allow callers to override via `init.credentials`.
  const headers = (init.body instanceof FormData)
    ? (init.headers ?? {})
    : ({ "Content-Type": "application/json", ...(init.headers ?? {}) });

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    credentials: (init.credentials ?? "include"),
    ...init,
  });

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
      const body = json as any;
      if (body.message) {
        message = String(body.message);
      } else if (Array.isArray(body.errors) && body.errors.length > 0) {
        message = body.errors
          .map((error: any) => {
            if (typeof error === "string") return error;
            if (error.msg && error.path) return `${error.path}: ${error.msg}`;
            if (error.msg) return error.msg;
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
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return apiRequest<Vendor[]>("/api/vendor", {
    method: "GET",
    headers,
  });
}

export function getAuthHeaders(token?: string) {
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
  // Image uploads are disabled in the frontend. Return a safe no-op result
  // so callers that still reference this function will not fail.
  return { data: null, error: "Profile image uploads are disabled" } as ApiResult<{ avatar: string }>;
}

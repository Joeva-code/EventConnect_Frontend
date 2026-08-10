import { NextRequest } from "next/server";

// Keep this value server-only. Set API_BASE_URL in Vercel for each environment.
const BACKEND_URL = process.env.API_BASE_URL ?? "https://horizon-circle.onrender.com";

const REQUEST_HEADERS_TO_REMOVE = [
  "host",
  "connection",
  "content-length",
];

const RESPONSE_HEADERS_TO_REMOVE = ["connection", "content-encoding", "content-length", "transfer-encoding"];

async function proxy(request: NextRequest, context: RouteContext<"/api/backend/[...path]">) {
  const { path } = await context.params;
  const target = new URL(`/${path.map(encodeURIComponent).join("/")}`, BACKEND_URL);
  target.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  REQUEST_HEADERS_TO_REMOVE.forEach((header) => headers.delete(header));

  try {
    const contentType = request.headers.get("content-type");
    const isMultipart = contentType?.includes("multipart/form-data");
    const body = request.method === "GET" || request.method === "HEAD" ? undefined : (isMultipart ? await request.blob() : await request.arrayBuffer());

    const response = await fetch(target, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
    });

    if (process.env.NODE_ENV !== 'production') {
      console.error(`[proxy] ${request.method} ${target.href} -> ${response.status} ${response.statusText}`, { contentType, isMultipart, responseContentType: response.headers.get('content-type') });
    }

    const responseHeaders = new Headers(response.headers);
    RESPONSE_HEADERS_TO_REMOVE.forEach((header) => responseHeaders.delete(header));

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      { message: "Authentication service is temporarily unavailable." },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;

// Netlify Edge Function: HTTP Basic Auth gate for /_seo-internal/*
// Protects the private SEO dashboard from public access.
// Configure BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD as Netlify env vars.

import type { Context } from "https://edge.netlify.com";

export default async function (request: Request, context: Context) {
  const USER = Deno.env.get("BASIC_AUTH_USERNAME");
  const PASS = Deno.env.get("BASIC_AUTH_PASSWORD");

  // Fail closed if env vars are not configured
  if (!USER || !PASS) {
    return new Response("Configuration error: BASIC_AUTH_USERNAME / BASIC_AUTH_PASSWORD env vars not set in Netlify.", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const authHeader = request.headers.get("authorization") || "";
  const expected = "Basic " + btoa(`${USER}:${PASS}`);

  if (authHeader !== expected) {
    return new Response("Authentication required.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="PuraVigor SEO Internal — authorized personnel only"',
        "Content-Type": "text/plain",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  }

  // Authorized: pass through to the static file
  const response = await context.next();
  // Even when authorized, prevent caching + indexing
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export const config = {
  path: "/_seo-internal/*",
};

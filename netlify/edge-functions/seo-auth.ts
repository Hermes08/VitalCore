// Netlify Edge Function: HTTP Basic Auth gate for /_seo-internal/*
// Protects the private SEO dashboard from public access.
// Reads BASIC_AUTH_USERNAME + BASIC_AUTH_PASSWORD from Netlify env vars.

export default async (request: Request, context: any) => {
  try {
    const USER = Deno.env.get("BASIC_AUTH_USERNAME") || "";
    const PASS = Deno.env.get("BASIC_AUTH_PASSWORD") || "";

    if (!USER || !PASS) {
      return new Response("Authentication required.", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="PuraVigor SEO Internal"',
          "Content-Type": "text/plain",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      });
    }

    const authHeader = request.headers.get("authorization") || "";
    const expected = "Basic " + btoa(USER + ":" + PASS);

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

    const response = await context.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  } catch (_err) {
    return new Response("Authentication required.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="PuraVigor SEO Internal"',
        "Content-Type": "text/plain",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  }
};

export const config = {
  path: "/_seo-internal/*",
};

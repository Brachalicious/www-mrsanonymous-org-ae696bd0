import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Server-side check for whether a URL allows being shown inside an iframe.
 * Browsers fire the iframe load event even when a site refuses framing
 * (X-Frame-Options: deny / CSP frame-ancestors), rendering a blank error
 * page that is indistinguishable from a successful load to client JS. So we
 * fetch the page headers from the server, where we can actually read them.
 *
 * Returns null when we cannot determine (network error, blocked fetch) —
 * callers should fall back to optimistic iframe behavior in that case.
 */
export const checkFramable = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ url: z.string().url() }).parse(data))
  .handler(async ({ data }) => {
    let target: URL;
    try {
      target = new URL(data.url);
    } catch {
      return { blocked: null as boolean | null };
    }
    if (target.protocol !== "https:" && target.protocol !== "http:") {
      return { blocked: null as boolean | null };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      let res: Response | null = null;
      try {
        res = await fetch(target.toString(), {
          method: "HEAD",
          redirect: "follow",
          signal: controller.signal,
          headers: { "User-Agent": "Mozilla/5.0 (compatible; MrsAnonymousFrameCheck/1.0)" },
        });
        // Some servers reject HEAD — retry with a minimal GET.
        if (res.status === 405 || res.status === 501 || res.status === 403) {
          res = await fetch(target.toString(), {
            method: "GET",
            redirect: "follow",
            signal: controller.signal,
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; MrsAnonymousFrameCheck/1.0)",
              Range: "bytes=0-0",
            },
          });
        }
      } finally {
        clearTimeout(timeout);
      }

      const xfo = res.headers.get("x-frame-options");
      if (xfo) {
        const v = xfo.toLowerCase();
        if (v.includes("deny") || v.includes("sameorigin")) {
          return { blocked: true };
        }
      }

      const csp = res.headers.get("content-security-policy");
      if (csp) {
        const directive = csp
          .split(";")
          .map((d) => d.trim())
          .find((d) => d.toLowerCase().startsWith("frame-ancestors"));
        if (directive) {
          const sources = directive.slice("frame-ancestors".length).trim().toLowerCase();
          if (sources.includes("'none'")) return { blocked: true };
          const allowsAny = sources.includes("*") || sources.includes("https:");
          if (!allowsAny) return { blocked: true };
        }
      }

      return { blocked: false };
    } catch {
      // Could not verify — let the client-side timer fallback handle it.
      return { blocked: null as boolean | null };
    }
  });

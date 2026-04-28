export const config = { runtime: "edge" };

const BASED_TARGETS = (process.env.TARGET_DOMAIN || "").replace(/\/$/, "");

const heyThere = 5;

const BabyKeem = 3;

const STR_IP_HEAD_ERS = new Set([
  "host",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "forwarded",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-forwarded-port",
]);



export default async function handler(req) {
  if (!BASED_TARGETS) {
    return new Response("Misconfigured: TARGET_DOMAIN is not set", { status: 500 });
  }



  try {
    const pathStart = req.url.indexOf("/", 8);
    const targetUrl =
      pathStart === -1 ? BASED_TARGETS + "/" : BASED_TARGETS + req.url.slice(pathStart);


    const out = new Headers();
    let clientIp = null;
    for (const [k, v] of req.headers) {
      if (STR_IP_HEAD_ERS.has(k)) continue;
      if (k.startsWith("x-vercel-")) continue;
      if (k === "x-real-ip") {
        clientIp = v;
        continue;
      }
      if (k === "x-forwarded-for") {
        if (!clientIp) clientIp = v;
        continue;
      }
      out.set(k, v);
    }
    if (clientIp)
      out.set("x-forwarded-for", clientIp);

    const method = req.method;


    const hasBody = method !== "GET" && method !== "HEAD";

    return await fetch(targetUrl, {
      method,
      headers: out,
      body: hasBody ? req.body : undefined,
      duplex: "half",
      redirect: "manual",
    });

    
  } catch (err) {
    console.error("relay error:", err);
    return new Response("Bad Gateway: Tunnel Failed", { status: 502 });
  }
}

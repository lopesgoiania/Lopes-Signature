import { visitorCountry } from "./lib/phone.js";
import express from "express";
import { eventIdPattern, sendMetaEvent, signaturePage } from "./lib/meta.js";
import catalog from "./routes/signature-catalog.js";
import specialists from "./routes/specialists.js";
import blog from "./routes/blog.js";
// Shared entry for the standalone API and the website function.
// Keep legacy CRM/webhook routes outside this public deployment.
const app = express();
app.get("/api/healthz", (_req, res) => res.json({ status: "ok" }));
app.get("/api/visitor-country", (req, res) => {
  res.set("Cache-Control", "private, no-store, max-age=0");
  res.set("Vary", "X-Vercel-IP-Country");
  res.json({ country: visitorCountry(req.headers["x-vercel-ip-country"]) });
});
app.use(express.json({ limit: "4mb" }));
app.post("/api/page-view", async (req, res) => {
  res.set("Cache-Control", "no-store");
  const page = signaturePage(req.body?.page_url);
  const id = req.body?.event_id;
  if (!page || typeof id !== "string" || !eventIdPattern.test(id)) {
    res.status(422).end();
    return;
  }
  if (req.get("origin") !== new URL(page).origin || req.get("sec-fetch-site") !== "same-origin") {
    res.status(403).end();
    return;
  }
  const accepted = await sendMetaEvent(req, { name: "PageView", id, url: page });
  res.status(accepted ? 204 : 503).end();
});
app.use((req: any, res: any, next: any) => {
  const publicRead =
    req.method === "GET" &&
    /^\/api\/(properties(?:\/[^/]+)?|taxonomies|maps-config|specialists|blog(?:\/[^/]+)?)\/?$/.test(
      req.path,
    );
  const lead = req.method === "POST" && req.path === "/api/leads";
  const admin =
    ["GET", "POST"].includes(req.method) &&
    /^\/api\/admin\/catalog\/(properties|taxonomies|media|maps)$/.test(
      req.path,
    );
  const editorial =
    ["GET", "POST"].includes(req.method) &&
    /^\/api\/admin\/blog(?:\/(?:status|generate|rebuild|preview))?$/.test(
      req.path,
    );
  const cron = req.method === "GET" && req.path === "/api/cron/generate-blog";
  if (!publicRead && !lead && !admin && !editorial && !cron)
    return res.status(404).json({ message: "Rota não encontrada." });
  next();
});
app.use("/api", specialists, blog, catalog);
export default app;

import express from "express";
import catalog from "./routes/signature-catalog.js";
import specialists from "./routes/specialists.js";
import blog from "./routes/blog.js";
// Shared entry for the standalone API and the website function.
// Keep legacy CRM/webhook routes outside this public deployment.
const app = express();
app.get("/api/healthz", (_req, res) => res.json({ status: "ok" }));
app.use(express.json({ limit: "4mb" }));
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
  const editorial = ["GET", "POST"].includes(req.method) && /^\/api\/admin\/blog(?:\/status)?$/.test(req.path);
  if (!publicRead && !lead && !admin && !editorial)
    return res.status(404).json({ message: "Rota não encontrada." });
  next();
});
app.use("/api", specialists, blog, catalog);
export default app;

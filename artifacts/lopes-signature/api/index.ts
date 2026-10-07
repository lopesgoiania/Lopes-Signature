import express from "express";
import catalog from "../../api-server/src/routes/signature-catalog.js";
import specialists from "../../api-server/src/routes/specialists.js";
import blog from "../../api-server/src/routes/blog.js";
const app = express();
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
  if (!publicRead && !lead && !admin)
    return res.status(404).json({ message: "Rota não encontrada." });
  next();
});
app.use("/api", catalog, specialists, blog);
export default app;

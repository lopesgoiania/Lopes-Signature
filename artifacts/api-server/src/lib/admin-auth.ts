import type { Request, Response, NextFunction } from "express";
import { supabase } from "./supabase.js";

export function createRequireAdmin(client = supabase) {
  return async function requireAdmin(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    res.setHeader("Cache-Control", "no-store");
    if (!client) {
      res.status(503).json({ message: "Serviço de gestão indisponível." });
      return;
    }
    const authorization = req.headers.authorization || "";
    if (!authorization.startsWith("Bearer ")) {
      res.status(401).json({ message: "Entre na gestão para continuar." });
      return;
    }
    try {
      const { data, error } = await client.auth.getUser(authorization.slice(7));
      const allowed = (
        process.env.SIGNATURE_ADMIN_EMAILS ||
        "therrysantos4@gmail.com,lopesgynadm@gmail.com"
      )
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
      if (
        error ||
        !data.user?.email ||
        !allowed.includes(data.user.email.toLowerCase())
      ) {
        res.status(403).json({ message: "Acesso restrito à gestão." });
        return;
      }
      next();
    } catch {
      res.status(503).json({ message: "Não foi possível verificar o acesso." });
    }
  };
}
export const requireAdmin = createRequireAdmin();

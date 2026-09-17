import { Router, type IRouter } from "express";
import { ListSpecialistsResponse } from "@workspace/api-zod";

const specialists = [
  {
    id: "ana-martins",
    name: "Ana Martins",
    role: "Senior Private Advisor",
    credential: "Signature Circle · 12 anos",
    bio: "Especialista em patrimônios residenciais e relações de longo prazo com famílias.",
    image: "/images/image_1788303912918.png",
    whatsapp: "5511999991111",
    listings: 18,
  },
  {
    id: "carlos-almeida",
    name: "Carlos Almeida",
    role: "Luxury Property Advisor",
    credential: "Top Performer · 2025",
    bio: "Conecta arquitetura autoral a decisões imobiliárias com discrição e precisão.",
    image: "/images/image_1788303907167.png",
    whatsapp: "5511988882222",
    listings: 14,
  },
  {
    id: "julia-souza",
    name: "Julia Souza",
    role: "Private Client Director",
    credential: "Signature Circle · 9 anos",
    bio: "Cuida de jornadas de compra complexas com uma visão ampla de estilo de vida.",
    image: "/images/image_1788303895261.png",
    whatsapp: "5511977773333",
    listings: 11,
  },
];

const router: IRouter = Router();

router.get("/specialists", (_req, res) => {
  res.json(ListSpecialistsResponse.parse(specialists));
});

export default router;
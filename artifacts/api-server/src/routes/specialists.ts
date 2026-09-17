import { Router, type IRouter } from "express";
import { ListSpecialistsResponse } from "@workspace/api-zod";

const specialists = [
  // Bueno
  { id: "celma", name: "Celma", role: "Especialista - Bueno Signature", credential: "Lopes Signature", bio: "Atendimento especializado na região do Bueno.", image: "/images/specialists/CELMA.png", whatsapp: "5562999999999", listings: 0 },
  { id: "geislaine", name: "Geislaine", role: "Especialista - Bueno Signature", credential: "Lopes Signature", bio: "Atendimento especializado na região do Bueno.", image: "/images/specialists/Geislaine.png", whatsapp: "5562999999999", listings: 0 },
  { id: "leandro-bender", name: "Leandro Bender", role: "Especialista - Bueno Signature", credential: "Lopes Signature", bio: "Atendimento especializado na região do Bueno.", image: "/images/specialists/LEANDRO BENDER.png", whatsapp: "5562999999999", listings: 0 },
  { id: "tadeu", name: "Tadeu", role: "Especialista - Bueno Signature", credential: "Lopes Signature", bio: "Atendimento especializado na região do Bueno.", image: "/images/specialists/TADEU.png", whatsapp: "5562999999999", listings: 0 },
  { id: "camilo", name: "Camilo", role: "Especialista - Bueno Signature", credential: "Lopes Signature", bio: "Atendimento especializado na região do Bueno.", image: "/images/specialists/camilo.png", whatsapp: "5562999999999", listings: 0 },

  // Marista
  { id: "bruna", name: "Bruna", role: "Especialista - Marista Signature", credential: "Lopes Signature", bio: "Atendimento especializado na região do Marista.", image: "/images/specialists/BRUNA.jpeg", whatsapp: "5562999999999", listings: 0 },
  { id: "divina", name: "Divina", role: "Especialista - Marista Signature", credential: "Lopes Signature", bio: "Atendimento especializado na região do Marista.", image: "/images/specialists/DIVINA.png", whatsapp: "5562999999999", listings: 0 },
  { id: "jairo", name: "Jairo", role: "Especialista - Marista Signature", credential: "Lopes Signature", bio: "Atendimento especializado na região do Marista.", image: "/images/specialists/JAIRO.png", whatsapp: "5562999999999", listings: 0 },
  { id: "jakellyne", name: "Jakellyne", role: "Especialista - Marista Signature", credential: "Lopes Signature", bio: "Atendimento especializado na região do Marista.", image: "/images/specialists/JAKELLYNE.png", whatsapp: "5562999999999", listings: 0 },
  { id: "marcelino", name: "Marcelino", role: "Especialista - Marista Signature", credential: "Lopes Signature", bio: "Atendimento especializado na região do Marista.", image: "/images/specialists/MARCELINO.png", whatsapp: "5562999999999", listings: 0 },
  { id: "roosevalt", name: "Roosevalt", role: "Especialista - Marista Signature", credential: "Lopes Signature", bio: "Atendimento especializado na região do Marista.", image: "/images/specialists/ROOSEVALT.jpg", whatsapp: "5562999999999", listings: 0 },
  { id: "lyeghe", name: "Lyeghe", role: "Especialista - Marista Signature", credential: "Lopes Signature", bio: "Atendimento especializado na região do Marista.", image: "/images/specialists/lyeghe.png", whatsapp: "5562999999999", listings: 0 },

  // Jardim Goiás
  { id: "anna-paula", name: "Anna Paula", role: "Especialista - Jardim Goiás Signature", credential: "Lopes Signature", bio: "Atendimento especializado na região do Jardim Goiás.", image: "/images/specialists/ANNA PAULA.png", whatsapp: "5562999999999", listings: 0 },
  { id: "claudio", name: "Claudio", role: "Especialista - Jardim Goiás Signature", credential: "Lopes Signature", bio: "Atendimento especializado na região do Jardim Goiás.", image: "/images/specialists/CLAUDIO.png", whatsapp: "5562999999999", listings: 0 },
  { id: "dariane", name: "Dariane", role: "Especialista - Jardim Goiás Signature", credential: "Lopes Signature", bio: "Atendimento especializado na região do Jardim Goiás.", image: "/images/specialists/Dariane.png", whatsapp: "5562999999999", listings: 0 },
  { id: "ingrid", name: "Ingrid", role: "Especialista - Jardim Goiás Signature", credential: "Lopes Signature", bio: "Atendimento especializado na região do Jardim Goiás.", image: "/images/specialists/Ingrid.jpg", whatsapp: "5562999999999", listings: 0 },
];

const router: IRouter = Router();

router.get("/specialists", (_req, res) => {
  res.json(ListSpecialistsResponse.parse(specialists));
});

export default router;
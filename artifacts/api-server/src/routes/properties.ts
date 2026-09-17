import { Router, type IRouter } from "express";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";

export type Floorplan = {
  id: string;
  title: string;
  area: string;
  price: number;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parking: number;
  image: string;
};

export type Property = {
  id: string;
  title: string;
  builder?: string;
  location: string;
  neighborhood: string;
  address?: string;
  category: string;
  price: number;
  area: number;
  bedrooms: number;
  suites: number;
  bathrooms?: number;
  parking: number;
  description: string;
  images: string[];
  gallery?: string[];
  floorplans?: Floorplan[];
  badges: string[];
  featured: boolean;
  lpUrl: string;
  pdfUrl?: string;
  status: string;
};

export const seedProperties: Property[] = [];

export let properties: Property[] = [];

const router: IRouter = Router();

// GET /api/properties - Listar produtos
router.get("/properties", async (req, res) => {
  const { search, category, region, featured } = req.query;
  const normalizedSearch = typeof search === "string" ? search.trim().toLowerCase() : "";

  let currentList = properties;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        currentList = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          builder: item.builder || "Signature Partner",
          location: item.location,
          neighborhood: item.address || item.location,
          address: item.address || "",
          category: "Apartamentos",
          price: Number(item.price) || 0,
          area: Number(item.area) || 0,
          bedrooms: item.bedrooms || 0,
          suites: item.suites || 0,
          bathrooms: item.bathrooms || 0,
          parking: item.parking || 0,
          description: item.description || "",
          images: item.images || ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"],
          gallery: item.gallery || item.images || [],
          floorplans: item.floorplans || [],
          badges: ["EXCLUSIVO"],
          featured: true,
          lpUrl: item.lp_url || `/lp/${item.id}`,
          pdfUrl: item.pdf_url || "",
          status: "Disponível",
        }));
      }
    } catch (e) {
      console.warn("Erro ao buscar properties no Supabase, usando memória:", e);
    }
  }

  const filtered = currentList.filter((property) => {
    const matchesSearch =
      !normalizedSearch ||
      `${property.title} ${property.builder || ""} ${property.location} ${property.neighborhood}`
        .toLowerCase()
        .includes(normalizedSearch);
    const matchesCategory = !category || property.category === category;
    const matchesRegion =
      !region ||
      property.location.toLowerCase().includes(String(region).toLowerCase()) ||
      property.neighborhood.toLowerCase().includes(String(region).toLowerCase());
    const matchesFeatured = featured === undefined || String(property.featured) === String(featured);

    return matchesSearch && matchesCategory && matchesRegion && matchesFeatured;
  });

  res.json(filtered);
});

// POST /api/properties - Criar produto no Admin
router.post("/properties", async (req, res) => {
  const body = req.body;
  if (!body.title || !body.location) {
    res.status(400).json({ message: "Nome do produto e localização são obrigatórios." });
    return;
  }

  const propertyId = body.id || `produto-${Date.now()}`;
  const property: Property = {
    id: propertyId,
    title: body.title,
    builder: body.builder || "Signature Partner",
    location: body.location,
    neighborhood: body.neighborhood || "Goiânia",
    address: body.address || "",
    category: body.category || "Apartamentos",
    price: Number(body.price) || 0,
    area: Number(body.area) || 0,
    bedrooms: Number(body.bedrooms) || 0,
    suites: Number(body.suites) || 0,
    bathrooms: Number(body.bathrooms) || 0,
    parking: Number(body.parking) || 0,
    description: body.description || "",
    images: Array.isArray(body.images) && body.images.length > 0 ? body.images : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"],
    gallery: Array.isArray(body.gallery) ? body.gallery : body.images || [],
    floorplans: Array.isArray(body.floorplans) ? body.floorplans : [],
    badges: Array.isArray(body.badges) ? body.badges : ["EXCLUSIVO"],
    featured: Boolean(body.featured),
    lpUrl: body.lpUrl || `/lp/${propertyId}`,
    pdfUrl: body.pdfUrl || "",
    status: body.status || "Disponível",
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("properties").insert({
        id: property.id,
        title: property.title,
        builder: property.builder,
        address: property.address,
        location: property.location,
        price: property.price,
        area: property.area,
        bedrooms: property.bedrooms,
        suites: property.suites,
        bathrooms: property.bathrooms,
        parking: property.parking,
        images: property.images,
        floorplans: property.floorplans,
        gallery: property.gallery,
        description: property.description,
        pdf_url: property.pdfUrl,
        lp_url: property.lpUrl,
      });
    } catch (e) {
      console.warn("Erro ao salvar produto no Supabase:", e);
    }
  }

  properties.unshift(property);
  res.status(201).json(property);
});

// GET /api/properties/:propertyId - Obter um produto
router.get("/properties/:propertyId", async (req, res) => {
  const { propertyId } = req.params;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .single();

      if (!error && data) {
        res.json({
          id: data.id,
          title: data.title,
          builder: data.builder || "Signature Partner",
          location: data.location,
          neighborhood: data.address || data.location,
          address: data.address || "",
          category: "Apartamentos",
          price: Number(data.price) || 0,
          area: Number(data.area) || 0,
          bedrooms: data.bedrooms || 0,
          suites: data.suites || 0,
          bathrooms: data.bathrooms || 0,
          parking: data.parking || 0,
          description: data.description || "",
          images: data.images || ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"],
          gallery: data.gallery || data.images || [],
          floorplans: data.floorplans || [],
          badges: ["EXCLUSIVO"],
          featured: true,
          lpUrl: data.lp_url || `/lp/${data.id}`,
          pdfUrl: data.pdf_url || "",
          status: "Disponível",
        });
        return;
      }
    } catch (e) {
      console.warn("Erro ao buscar produto por ID no Supabase:", e);
    }
  }

  const property = properties.find((item) => item.id === propertyId);
  if (!property) {
    res.status(404).json({ message: "Produto não encontrado." });
    return;
  }
  res.json(property);
});

// PATCH /api/properties/:propertyId - Atualizar produto
router.patch("/properties/:propertyId", async (req, res) => {
  const { propertyId } = req.params;

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("properties").update(req.body).eq("id", propertyId);
    } catch (e) {
      console.warn("Erro ao atualizar produto no Supabase:", e);
    }
  }

  const index = properties.findIndex((item) => item.id === propertyId);
  if (index === -1) {
    res.status(404).json({ message: "Produto não encontrado." });
    return;
  }
  const updated = { ...properties[index], ...req.body };
  properties[index] = updated;
  res.json(updated);
});

// DELETE /api/properties/:propertyId - Deletar produto
router.delete("/properties/:propertyId", async (req, res) => {
  const { propertyId } = req.params;

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("properties").delete().eq("id", propertyId);
    } catch (e) {
      console.warn("Erro ao deletar produto no Supabase:", e);
    }
  }

  const index = properties.findIndex((item) => item.id === propertyId);
  if (index !== -1) {
    properties.splice(index, 1);
  }
  res.status(204).send();
});

export default router;
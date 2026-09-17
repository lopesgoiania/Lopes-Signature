import { Router, type IRouter } from "express";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";

export type BlogPost = {
  id: string;
  title: string;
  category: string;
  author: string;
  readTime: string;
  date: string;
  summary: string;
  content: string;
  image: string;
  published: boolean;
};

export const curatedTopics = [
  "A Evolução do Metro Quadrado no Setor Marista: Onde o Luxo Encontra a Alta Rentabilidade",
  "Casas de Alto Padrão em Condomínios Fechados de Goiânia: Exclusividade e Segurança",
  "Arquitetura Autoral e Paisagismo de Assinatura nos Lançamentos Imobiliários de Goiânia",
  "Investindo no Setor Bueno: A Vista Definitiva para o Parque Vaca Brava como Ativo Imobiliário",
  "Penthouse e Coberturas de Luxo em Goiânia: O Auge da Privacidade e Conforto",
  "Tendências do Mercado Imobiliário de Alto Padrão em Goiânia: Automação e Sustentabilidade",
  "O Valor do Mármore Travertino e Acabamentos Nobres no Valor de Revenda dos Empreendimentos",
  "Por Que Goiânia se Tornou o Polo de Investimento Imobiliário Mais Cobiçado do Centro-Oeste",
];

export let blogPosts: BlogPost[] = [];

const router: IRouter = Router();

// GET /api/blog - Listar posts
router.get("/blog", async (_req, res) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const mapped = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          author: item.author || "IA Lopes Signature",
          readTime: item.read_time || "5 min de leitura",
          date: item.date || new Date(item.created_at).toLocaleDateString("pt-BR"),
          summary: item.summary,
          content: item.content,
          image: item.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
          published: true,
        }));
        res.json(mapped);
        return;
      }
    } catch (e) {
      console.warn("Erro ao buscar blog_posts no Supabase, caindo em memória:", e);
    }
  }

  res.json(blogPosts);
});

// GET /api/blog/:id - Obter post específico
router.get("/blog/:id", async (req, res) => {
  const { id } = req.params;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        res.json({
          id: data.id,
          title: data.title,
          category: data.category,
          author: data.author || "IA Lopes Signature",
          readTime: data.read_time || "5 min de leitura",
          date: data.date || new Date(data.created_at).toLocaleDateString("pt-BR"),
          summary: data.summary,
          content: data.content,
          image: data.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
          published: true,
        });
        return;
      }
    } catch (e) {
      console.warn("Erro ao buscar post por ID no Supabase:", e);
    }
  }

  const post = blogPosts.find((p) => p.id === id);
  if (!post) {
    res.status(404).json({ message: "Artigo não encontrado." });
    return;
  }
  res.json(post);
});

// POST /api/blog - Criar post manualmente
router.post("/blog", async (req, res) => {
  const { title, category, author, summary, content, image } = req.body;
  if (!title || !content) {
    res.status(400).json({ message: "Título e conteúdo são obrigatórios." });
    return;
  }

  const newPost: BlogPost = {
    id: `post-${Date.now()}`,
    title,
    category: category || "Mercado Imobiliário",
    author: author || "Curadoria Lopes Signature",
    readTime: `${Math.max(3, Math.ceil(content.length / 500))} min de leitura`,
    date: new Date().toLocaleDateString("pt-BR"),
    summary: summary || content.slice(0, 150) + "...",
    content,
    image: image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    published: true,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("blog_posts").insert({
        id: newPost.id,
        title: newPost.title,
        category: newPost.category,
        summary: newPost.summary,
        content: newPost.content,
        image: newPost.image,
        date: newPost.date,
        read_time: newPost.readTime,
        author: newPost.author,
      });
    } catch (e) {
      console.warn("Erro ao salvar post no Supabase:", e);
    }
  }

  blogPosts.unshift(newPost);
  res.status(201).json(newPost);
});

// DELETE /api/blog/:id - Deletar post
router.delete("/blog/:id", async (req, res) => {
  const { id } = req.params;

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("blog_posts").delete().eq("id", id);
    } catch (e) {
      console.warn("Erro ao deletar post no Supabase:", e);
    }
  }

  const index = blogPosts.findIndex((p) => p.id === id);
  if (index !== -1) {
    blogPosts.splice(index, 1);
  }

  res.status(204).send();
});

// Função auxiliar para disparar geração de IA via OpenRouter
async function generatePostWithOpenRouter(options: {
  apiKey: string;
  topic: string;
  model?: string;
  region?: string;
}) {
  const { apiKey, topic, model = "google/gemini-2.5-flash", region = "Goiânia - GO" } = options;

  const systemPrompt = `Você é um jornalista sênior especialista em mercado imobiliário de altíssimo padrão, investimentos imobiliários, arquitetura de luxo e urbanismo focado na região de ${region}.
Escreva um artigo de blog completo, altamente relevante, refinado, convincente e com EXCELENTE ESTRUTURA DE SEO para o portal "Lopes Signature".
Utilize obrigatoriamente um título principal H1, títulos de seção H2 e subtópicos H3 relevantes.
Responda EXCLUSIVAMENTE em formato JSON válido com as seguintes chaves:
{
  "title": "Título impactante do artigo",
  "category": "Categoria (ex: Investimentos, Arquitetura & Design, Tendências de Mercado, Lançamentos)",
  "summary": "Resumo envolvente de 2 frases otimizado para meta-description e capa",
  "content": "Conteúdo completo em Markdown formatado com # H1, ## H2, ### H3, negritos e listas de alto valor"
}`;

  const userPrompt = `Escreva um artigo de blog completo, com tom sofisticado e aprofundado sobre o tema: "${topic}" na região de ${region}. Foque em valorização, acabamentos nobres, exclusividade, liquidez e diferenciais dos bairros nobres (Setor Marista, Bueno, Oeste, etc.).`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://lopessignature.com.br",
      "X-Title": "Lopes Signature IA Blog Agent",
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${errText}`);
  }

  const data = (await response.json()) as any;
  const rawContent = data.choices?.[0]?.message?.content || "";

  let parsedJson: { title: string; category: string; summary: string; content: string };
  try {
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    parsedJson = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent);
  } catch {
    parsedJson = {
      title: `Mercado de Luxo: ${topic}`,
      category: "Investimentos",
      summary: "Uma análise aprofundada sobre o comportamento do mercado de alto padrão em Goiânia.",
      content: rawContent,
    };
  }

  const newPost: BlogPost = {
    id: `post-ai-${Date.now()}`,
    title: parsedJson.title || topic,
    category: parsedJson.category || "Mercado Imobiliário",
    author: "Agente IA OpenRouter Signature",
    readTime: `${Math.max(4, Math.ceil((parsedJson.content?.length || 1000) / 450))} min de leitura`,
    date: new Date().toLocaleDateString("pt-BR"),
    summary: parsedJson.summary || "Artigo gerado por Inteligência Artificial sobre o mercado de luxo.",
    content: parsedJson.content || rawContent,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    published: true,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("blog_posts").insert({
        id: newPost.id,
        title: newPost.title,
        category: newPost.category,
        summary: newPost.summary,
        content: newPost.content,
        image: newPost.image,
        date: newPost.date,
        read_time: newPost.readTime,
        author: newPost.author,
      });
    } catch (e) {
      console.warn("Erro ao salvar artigo gerado no Supabase:", e);
    }
  }

  blogPosts.unshift(newPost);
  return newPost;
}

// POST /api/blog/generate-ai - Gerar artigo manualmente via Admin
router.post("/blog/generate-ai", async (req, res) => {
  const apiKey = (req.body.apiKey || process.env.OPENROUTER_API_KEY || "").trim();
  const { model = "google/gemini-2.5-flash", topic, region = "Goiânia - GO" } = req.body;

  if (!apiKey) {
    res.status(400).json({
      message: "Chave de API do OpenRouter (OPENROUTER_API_KEY) não encontrada. Adicione no arquivo .env ou no formulário.",
    });
    return;
  }

  const selectedTopic = topic || "Tendências do Mercado Imobiliário de Luxo e Valorização de Imóveis de Alto Padrão";

  try {
    const newPost = await generatePostWithOpenRouter({ apiKey, topic: selectedTopic, model, region });
    res.status(201).json(newPost);
  } catch (error: any) {
    res.status(500).json({
      message: `Falha ao comunicar com a IA do OpenRouter: ${error?.message || error}`,
    });
  }
});

// GET e POST /api/cron/generate-blog - Execução automática 2x por dia (Vercel Cron)
const handleCron = async (_req: any, res: any) => {
  const apiKey = (process.env.OPENROUTER_API_KEY || "").trim();
  if (!apiKey) {
    res.status(400).json({ message: "OPENROUTER_API_KEY não configurada no ambiente." });
    return;
  }

  // Rotacionar tópicos com base na hora e dia atual
  const randomIndex = Math.floor(Math.random() * curatedTopics.length);
  const topic = curatedTopics[randomIndex];

  try {
    const post = await generatePostWithOpenRouter({
      apiKey,
      topic,
      model: "google/gemini-2.5-flash",
      region: "Goiânia - GO",
    });
    res.status(201).json({ success: true, message: "Artigo gerado automaticamente via Cron com sucesso!", post });
  } catch (err: any) {
    res.status(500).json({ message: `Erro no Cron de IA: ${err?.message || err}` });
  }
};

router.get("/cron/generate-blog", handleCron);
router.post("/cron/generate-blog", handleCron);

export default router;

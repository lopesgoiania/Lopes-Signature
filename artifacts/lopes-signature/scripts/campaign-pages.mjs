import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function campaignPages(root, dist, origin) {
  const manifest = JSON.parse(await readFile(path.join(root, 'campaigns/manifest.json'), 'utf8'));
  const routes = [];
  for (const { slug, card } of manifest) {
    const route = `/${slug}`;
    const url = new URL(route, origin).href;
    const image = new URL(card?.images?.[0] || `/campanhas/${slug}/assets/fachada.webp`, origin).href;
    let html = await readFile(path.join(root, 'campaigns', slug, 'index.html'), 'utf8');
    const title = html.match(/<title>(.*?)<\/title>/s)[1];
    const description = html.match(/<meta name="description" content="([^"]*)"/)[1];
    if (!/<meta name="robots"/.test(html)) html = html.replace('</head>', '<meta name="robots" content="index,follow,max-image-preview:large"></head>');
    html = html.replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="index,follow,max-image-preview:large">')
      .replace('<head>', `<head>\n  <base href="/campanhas/${slug}/">`)
      .replace(/href="#([^"]*)"/g, `href="${route}#$1"`)
      .replace('</head>', `<link rel="canonical" href="${url}">\n<meta property="og:type" content="website">\n<meta property="og:site_name" content="Lopes Signature">\n<meta property="og:locale" content="pt_BR">\n<meta property="og:title" content="${title}">\n<meta property="og:description" content="${description}">\n<meta property="og:url" content="${url}">\n<meta property="og:image" content="${image}">\n<meta name="twitter:card" content="summary_large_image">\n</head>`);
    await writeFile(path.join(dist, `${slug}.html`), html);
    routes.push(route);
  }
  return routes;
}

"""Manually snapshot public catalog covers as responsive WebP assets.
Existing source URLs remain the keys, so newly edited URLs fall back to their originals.
No download or image processing runs on a visitor request or Vercel deployment.
"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import urlopen
from io import BytesIO
import hashlib, json
from PIL import Image, ImageOps
root = Path(__file__).resolve().parents[1] / 'artifacts/lopes-signature'
manifest_path = root / 'src/lib/image-manifest.json'
manifest = json.loads(manifest_path.read_text())
with urlopen('https://lopessignature.vercel.app/api/properties', timeout=30) as response:
    properties = json.load(response)
urls = sorted({p['images'][0] for p in properties if p.get('images') and p['images'][0].startswith('https://') and p['images'][0] not in manifest})
def optimize(url):
    with urlopen(url, timeout=45) as response:
        raw = response.read(25_000_001)
    if len(raw) > 25_000_000: raise ValueError('Image exceeds processing limit')
    image = ImageOps.exif_transpose(Image.open(BytesIO(raw))).convert('RGB')
    digest = hashlib.sha256(raw).hexdigest()[:12]
    sources = []; total = 0
    for width in sorted({min(w, image.width) for w in [480, 960, 1600]}):
        candidate = image.copy(); candidate.thumbnail((width, width * 4), Image.Resampling.LANCZOS)
        name = f'catalog-{digest}-{candidate.width}.webp'
        target = root / 'public/images/optimized' / name
        candidate.save(target, 'WEBP', quality=85, method=6)
        total += target.stat().st_size
        sources.append({'src': '/images/optimized/' + name, 'width': candidate.width})
    return url, {'width': image.width, 'height': image.height, 'sources': sources}, len(raw), total
results = list(ThreadPoolExecutor(max_workers=4).map(optimize, urls))
for url, item, _, _ in results: manifest[url] = item
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'covers': len(results), 'originalBytes': sum(x[2] for x in results), 'allVariantsBytes': sum(x[3] for x in results)}))

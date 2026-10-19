"""Create responsive WebP derivatives; preserve every original and provenance record.
Run manually with Python + Pillow; generated files are committed, not regenerated on Vercel.
"""
from pathlib import Path
from PIL import Image, ImageOps
import hashlib, json, re
root = Path(__file__).resolve().parents[1] / 'artifacts/lopes-signature'
public = root / 'public'
output = public / 'images/optimized'
output.mkdir(parents=True, exist_ok=True)
files = sorted((public / 'images/specialists').glob('*')) + [public / 'images/signature-hero-poster.jpg', public / 'images/epic-signature-hero.jpg']
manifest_path = root / 'src/lib/image-manifest.json'
manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
original_bytes = derivative_bytes = 0
for source in files:
    if source.suffix.lower() not in {'.png', '.jpg', '.jpeg', '.webp'}:
        continue
    digest = hashlib.sha256(source.read_bytes()).hexdigest()[:10]
    stem = re.sub(r'[^a-z0-9]+', '-', source.stem.lower()).strip('-')
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        if image.mode not in ('RGB', 'RGBA'): image = image.convert('RGBA' if 'transparency' in opened.info else 'RGB')
        widths = [320, 640, 960] if source.parent.name == 'specialists' else [768, 1280, 1920]
        widths = sorted(set(min(width, image.width) for width in widths))
        sources = []
        for width in widths:
            candidate = image.copy()
            candidate.thumbnail((width, width * 3), Image.Resampling.LANCZOS)
            name = f'{stem}-{digest}-{candidate.width}.webp'
            target = output / name
            candidate.save(target, 'WEBP', quality=85, method=6, icc_profile=opened.info.get('icc_profile', b''))
            derivative_bytes += target.stat().st_size
            sources.append({'src': '/images/optimized/' + name, 'width': candidate.width})
        original_bytes += source.stat().st_size
        manifest['/' + source.relative_to(public).as_posix()] = {'width': image.width, 'height': image.height, 'sources': sources}
(root / 'src/lib/image-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'images': len(manifest), 'originalBytes': original_bytes, 'allDerivativeBytes': derivative_bytes}))

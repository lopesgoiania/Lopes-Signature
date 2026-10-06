import { useEffect, useRef, useState } from 'react';

export function ScrollVideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [failed, setFailed] = useState(false);
  const base = import.meta.env.BASE_URL;

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused || reduceMotion) video.pause();
    else video.play().catch(() => setPaused(true));
  }, [paused, reduceMotion]);

  return (
    <section className="relative isolate overflow-hidden bg-[#121212]">
      <img src={`${base}images/signature-hero-poster.jpg`} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
      {!reduceMotion && !failed && (
        <video
          ref={videoRef}
          src={`${base}videos/signature-hero.mp4`}
          poster={`${base}images/signature-hero-poster.jpg`}
          autoPlay muted loop playsInline preload="metadata"
          aria-hidden="true"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
      <div className="relative z-10 flex min-h-[100svh] items-center justify-center pb-28 pt-40 md:pt-44">
          <div className="max-w-4xl text-center px-6">
            <p className="mono-label mb-5 text-primary drop-shadow-md">
              O alto padrão de Goiânia
            </p>
            <h1 className="serif text-5xl leading-[1.1] tracking-[-.03em] text-[#F7F5F0] md:text-7xl drop-shadow-xl">
              Residências exclusivas,<br />
              <em className="font-normal text-primary">nos bairros mais desejados.</em>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#D0D0D0] drop-shadow-md">
              Uma seleção de imóveis de luxo apresentada por especialistas que conhecem os empreendimentos, suas particularidades e o mercado de Goiânia.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 pointer-events-auto">
              <a href="#catalogo" className="metal-button flex items-center gap-2 rounded-full px-7 py-3.5 text-xs font-bold" data-testid="link-hero-explorar">
                Explore os imóveis
              </a>
              <a href="/contato" className="flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-xs text-[#F7F5F0] hover:border-primary hover:text-primary transition" data-testid="link-hero-falar">
                Fale com um especialista
              </a>
            </div>
          </div>
      </div>
      {!reduceMotion && !failed && (
        <button type="button" onClick={() => setPaused(!paused)}
          className="absolute bottom-12 right-6 z-20 rounded-full border border-white/40 bg-black/40 px-4 py-2 text-xs text-white hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          aria-label={paused ? 'Reproduzir vídeo de fundo' : 'Pausar vídeo de fundo'}>
          {paused ? 'Reproduzir vídeo' : 'Pausar vídeo'}
        </button>
      )}
    </section>
  );
}

import { useId, useState } from "react";
import { Lightbox, money } from "@/components/signature-ui";
export function PropertyPlans({ property }: { property: any }) {
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState(false);
  const uid = useId();
  const plans = property.floorplans || [];
  const index = Math.min(selected, Math.max(0, plans.length - 1));
  const plan = plans[index];
  if (!plan) return null;
  return (
    <div className="property-plan-browser">
      <div
        role="tablist"
        aria-label="Plantas disponíveis"
        className="mb-6 flex flex-wrap gap-3"
      >
        {plans.map((p: any, i: number) => (
          <button
            key={p.id || i}
            id={`${uid}-tab-${i}`}
            role="tab"
            aria-selected={i === index}
            aria-controls={`${uid}-panel`}
            tabIndex={i === index ? 0 : -1}
            onKeyDown={(e) => {
              const step =
                e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
              if (step) {
                e.preventDefault();
                const next = (i + step + plans.length) % plans.length;
                setSelected(next);
                document.getElementById(`${uid}-tab-${next}`)?.focus();
              }
            }}
            onClick={() => setSelected(i)}
            className={`min-w-[125px] rounded-2xl border px-5 py-4 text-left ${i === index ? "border-[#d4af37] bg-[#d4af37]/15 text-[#e8c766]" : "border-white/20 text-[#c9c9c9]"}`}
          >
            <span className="block text-xs">
              {p.bedrooms
                ? `${p.bedrooms} quartos`
                : p.suites
                  ? `${p.suites} suítes`
                  : p.title}
            </span>
            <span className="mt-1 block text-2xl">
              {new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(Number(p.area))} <small className="text-xs">m²</small>
            </span>
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${uid}-panel`}
        aria-labelledby={`${uid}-tab-${index}`}
        className="grid items-start gap-8 md:grid-cols-[1.4fr_1fr]"
      >
        <div>
          {plan.image && (
            <button
              onClick={() => setZoom(true)}
              aria-label={`Ampliar ${plan.title || "planta"}`}
              className="w-full rounded-3xl bg-[#f7f5f0] p-4"
            >
              <img
                src={plan.image}
                alt={plan.title || `Planta de ${plan.area} m²`}
                className="max-h-[560px] w-full object-contain"
                loading="lazy"
              />
            </button>
          )}
          <p className="mt-3 text-xs text-[#9a9a9a]">{plan.title}</p>
        </div>
        <div className="rounded-3xl border border-white/15 bg-[#161618] p-6">
          <p className="text-xs uppercase tracking-widest text-[#9a9a9a]">
            Valor desta planta
          </p>
          <p className="serif mt-3 text-3xl text-[#e8c766]">
            {Number(plan.price) > 0
              ? money(Number(plan.price))
              : "Sob consulta"}
          </p>
          <h3 className="serif mb-4 mt-7 text-2xl text-white">
            Características desta planta
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-[#c9c9c9]">
            {[
              ["area", "m²"],
              ["suites", "suítes"],
              ["bathrooms", "banheiros"],
              ["parking", "vagas"],
            ].map(([key, label]) =>
              plan[key] !== undefined && plan[key] !== "" ? (
                <span key={key}>
                  {key==='area'?new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(Number(plan[key])):plan[key]} {label}
                </span>
              ) : null,
            )}
          </div>
          <a
            href="#agendar"
            className="metal-button mt-8 flex justify-center rounded-full px-6 py-3 text-xs font-bold"
          >
            Conversar sobre esta planta
          </a>
        </div>
      </div>
      {zoom && plan.image && (
        <Lightbox
          images={[plan.image]}
          active={0}
          onClose={() => setZoom(false)}
          onNext={() => {}}
          onPrev={() => {}}
        />
      )}
    </div>
  );
}

import { Link } from "wouter";
import { PublicNav } from "@/components/signature-ui";
export default function NotFound() {
  return (
    <div className="signature-shell min-h-screen bg-background text-foreground">
      <PublicNav />
      <main className="mx-auto max-w-2xl px-6 pb-24 pt-44">
        <h1 className="serif text-4xl md:text-5xl">Página não encontrada.</h1>
        <p className="mt-6 leading-7 text-muted-foreground">
          O endereço pode ter mudado ou não estar mais disponível. Continue pelo
          catálogo ou converse com nossa equipe.
        </p>
        <div className="mt-8 flex flex-wrap gap-6">
          <Link href="/imoveis" className="min-h-11 underline">
            Ver imóveis
          </Link>
          <Link href="/contato" className="min-h-11 underline">
            Solicitar atendimento
          </Link>
        </div>
      </main>
    </div>
  );
}

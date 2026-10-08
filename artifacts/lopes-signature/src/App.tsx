import TaxonomyCatalogPage from "@/pages/taxonomy-catalog-page";
import CatalogPropertyPage from "@/pages/catalog-property-page";
import PropertyDesignPreview from "@/pages/property-design-preview";
import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import PropertyDetailPage from "@/pages/property-detail";
import AdminPage from "@/pages/admin";
import AboutPage from "@/pages/about-page";
import JournalPage from "@/pages/journal-page";
import SpecialistsPage from "@/pages/specialists-page";
import ContactPage from "@/pages/contact-page";
import LandingPage from "@/pages/landing-page";
import BauhausPage from "@/pages/bauhaus-page";
import CatalogPage from "@/pages/catalog-page";
import { Route, Switch, Redirect, useLocation, Router as WouterRouter } from "wouter";

const queryClient = new QueryClient();

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/previa/imoveis/:id" component={PropertyDesignPreview} />
        <Route path="/" component={HomePage} />
        <Route
          path="/imoveis/taxonomia/:kind/:slug"
          component={TaxonomyCatalogPage}
        />
        <Route path="/imoveis/:id" component={CatalogPropertyPage} />
        <Route path="/property/:id" component={CatalogPropertyPage} />
        <Route
          path="/lp/bauhaus-vaca-brava"
          component={() => <BauhausPage />}
        />
        <Route path="/lp/bauhaus" component={() => <BauhausPage />} />
        <Route path="/lp/:id" component={() => <LandingPage />} />
        <Route path="/especialistas" component={SpecialistsPage} />
        <Route path="/sobre" component={AboutPage} />
        <Route path="/journal" component={JournalPage} />
        <Route path="/journal/:id" component={JournalPage} />
        <Route path="/contato" component={ContactPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/imoveis">
          <CatalogPage
            title="Explore o catálogo Lopes Signature"
            description="Descubra casas, apartamentos e coberturas de alto padrão em Goiânia."
          />
        </Route>
        <Route path="/empreendimentos" component={() => <Redirect to="/imoveis" />} />
        <Route path="/casas-alto-padrao-goiania">
          <CatalogPage
            category="casa"
            title="Casas de alto padrão em Goiânia"
            description="Explore casas com diferentes propostas de arquitetura e áreas de convivência."
          />
        </Route>
        <Route path="/apartamentos-luxo-goiania">
          <CatalogPage
            category="apartamento"
            title="Apartamentos de luxo em Goiânia"
            description="Conheça apartamentos que combinam localização e conforto para o dia a dia."
          />
        </Route>
        <Route path="/coberturas-goiania">
          <CatalogPage
            category="cobertura"
            title="Coberturas em Goiânia"
            description="Explore coberturas com espaços amplos e áreas externas privativas."
          />
        </Route>
        <Route path="/conteudos" component={JournalPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter
          base={
            import.meta.env.BASE_URL === "/"
              ? undefined
              : import.meta.env.BASE_URL.replace(/\/$/, "")
          }
        >
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

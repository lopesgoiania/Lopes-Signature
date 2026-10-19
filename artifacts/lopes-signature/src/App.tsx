import { catalogRequest } from "@/lib/catalog";
import { pageSeo, usePageSeo } from "@/lib/seo";
const TaxonomyCatalogPage = lazy(() => import("@/pages/taxonomy-catalog-page"));
const CatalogPropertyPage = lazy(() => import("@/pages/catalog-property-page"));
const PropertyDesignPreview = lazy(
  () => import("@/pages/property-design-preview"),
);
import { type ReactNode, lazy, Suspense } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
const NotFound = lazy(() => import("@/pages/not-found"));
const HomePage = lazy(() => import("@/pages/home"));
const AdminPage = lazy(() => import("@/pages/admin"));
const AboutPage = lazy(() => import("@/pages/about-page"));
const JournalPage = lazy(() => import("@/pages/journal-page"));
const SpecialistsPage = lazy(() => import("@/pages/specialists-page"));
const ContactPage = lazy(() => import("@/pages/contact-page"));
const LandingPage = lazy(() => import("@/pages/landing-page"));
const BauhausPage = lazy(() => import("@/pages/bauhaus-page"));
const CatalogPage = lazy(() => import("@/pages/catalog-page"));
import {
  Route,
  Switch,
  Redirect,
  useLocation,
  Router as WouterRouter,
} from "wouter";

export const createAppQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000, refetchOnWindowFocus: false },
    },
  });

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
        <Route
          path="/empreendimentos"
          component={() => <Redirect to="/imoveis" />}
        />
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

function RouteMetadata() {
  const [location] = useLocation();
  const category =
    /^(\/casas-alto-padrao-goiania|\/apartamentos-luxo-goiania|\/coberturas-goiania)$/.test(
      location,
    );
  const properties = useQuery<any[]>({
    queryKey: ["/api/properties"],
    queryFn: () => catalogRequest("properties"),
    enabled: category,
  });
  const pageOwnsMetadata = /^\/(imoveis|journal)\/.+/.test(location) || location === '/conteudos';
  usePageSeo(
    pageOwnsMetadata ? undefined : pageSeo(
      location,
      category && properties.data
        ? {
            properties: properties.data,
            taxonomies: [],
            specialists: [],
            posts: [],
          }
        : undefined,
    ),
  );
  return null;
}

function App({
  queryClient = createAppQueryClient(),
  ssrPath,
}: {
  queryClient?: QueryClient;
  ssrPath?: string;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter
          ssrPath={ssrPath}
          base={
            import.meta.env.BASE_URL === "/"
              ? undefined
              : import.meta.env.BASE_URL.replace(/\/$/, "")
          }
        >
          <RouteMetadata />
          <Suspense
            fallback={
              <main className="signature-shell min-h-screen p-10" role="status">
                Carregando página…
              </main>
            }
          >
            <Router />
          </Suspense>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

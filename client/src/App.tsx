import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import { lazy, Suspense, useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import NewsletterWidget from "./components/NewsletterWidget";
import CookieBanner from "./components/CookieBanner";

// ── Páginas carregadas imediatamente (above-the-fold críticas) ──
import Home from "./pages/Home";
import NotFound from "@/pages/NotFound";

// ── Todas as outras páginas em lazy (code splitting) ──
const Blog = lazy(() => import("./pages/Blog"));
const BlogPostPage = lazy(() => import("./pages/BlogPost"));
const BlogPostDB = lazy(() => import("./pages/BlogPostDB"));
const CasosV2 = lazy(() => import("./pages/CasosV2"));
const Contact = lazy(() => import("./pages/Contact"));
const Partners = lazy(() => import("./pages/Partners"));
const Careers = lazy(() => import("./pages/Careers"));
const CareerDetail = lazy(() => import("./pages/CareerDetail"));
const About = lazy(() => import("./pages/About"));
const Press = lazy(() => import("./pages/Press"));
const Platform = lazy(() => import("./pages/Platform"));
const Support = lazy(() => import("./pages/Support"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Recursos = lazy(() => import("./pages/Recursos"));
const Backoffice = lazy(() => import("./pages/Backoffice"));
const BackofficeLogin = lazy(() => import("./pages/BackofficeLogin"));
const BackofficeCandidaturaDetalhe = lazy(() => import("./pages/BackofficeCandidaturaDetalhe"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Formacoes = lazy(() => import("./pages/Formacoes"));
const FormacaoDetalhe = lazy(() => import("./pages/FormacaoDetalhe"));
const Ebooks = lazy(() => import("./pages/Ebooks"));
const Equipa = lazy(() => import("./pages/Equipa"));
const Servicos = lazy(() => import("./pages/Servicos"));
const ServicoPsicologia = lazy(() => import("./pages/ServicoPsicologia"));
const ServicoJuridico = lazy(() => import("./pages/ServicoJuridico"));
const ServicoSocial = lazy(() => import("./pages/ServicoSocial"));
const ServicoFinanceiro = lazy(() => import("./pages/ServicoFinanceiro"));
const ServicoNutricao = lazy(() => import("./pages/ServicoNutricao"));
const Agendar = lazy(() => import("./pages/Agendar"));
const Academia = lazy(() => import("./pages/Academia"));
const CatalogoFormacao = lazy(() => import("./pages/CatalogoFormacao"));
const COPSOQ = lazy(() => import("./pages/COPSOQ"));
const ROI = lazy(() => import("./pages/ROI"));
const Opiniao = lazy(() => import("./pages/Opiniao"));
const OpiniaoPost = lazy(() => import("./pages/OpiniaoPost"));
const Questionario = lazy(() => import("./pages/Questionario"));
const CRM = lazy(() => import("./pages/CRM"));
const CRMLogin = lazy(() => import("./pages/CRMLogin"));

// Fallback mínimo para Suspense (sem spinner visível para transições rápidas)
function PageFallback() {
  return <div style={{ minHeight: "100vh" }} />;
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Switch>
          <Route path={"/"} component={Home} />
          <Route path={"/blog"} component={Blog} />
          <Route path={"/blog/:slug"} component={BlogPostPage} />
          <Route path={"/blog/artigo/:id"} component={BlogPostDB} />
          <Route path={"/casos"} component={CasosV2} />
          <Route path={"/casos-v2"} component={CasosV2} />
          <Route path={"/contacto"} component={Contact} />
          <Route path={"/parceiros"} component={Partners} />
          <Route path={"/carreiras"} component={Careers} />
          <Route path={"/carreiras/:slug"} component={CareerDetail} />
          <Route path={"/quem-somos"} component={About} />
          <Route path={"/imprensa"} component={Press} />
          <Route path={"/plataforma"} component={Platform} />
          <Route path={"/suporte"} component={Support} />
          <Route path={"/aviso-legal"} component={Privacy} />
          <Route path={"/termos"} component={Terms} />
          <Route path={"/recursos"} component={Recursos} />
          <Route path={"/backoffice/login"} component={BackofficeLogin} />
          <Route path={"/backoffice/candidaturas/:id"} component={BackofficeCandidaturaDetalhe} />
          <Route path={"/backoffice"} component={Backoffice} />
          <Route path={"/backoffice/:section"} component={Backoffice} />
          <Route path={"/demo"} component={LandingPage} />
          <Route path={"/formacoes"} component={Formacoes} />
          <Route path={"/formacoes/:id"} component={FormacaoDetalhe} />
          <Route path={"/ebooks"} component={Ebooks} />
          <Route path={"/equipa"} component={Equipa} />
          <Route path={"/servicos"} component={Servicos} />
          <Route path={"/servicos/psicologia"} component={ServicoPsicologia} />
          <Route path={"/servicos/juridico"} component={ServicoJuridico} />
          <Route path={"/servicos/social"} component={ServicoSocial} />
          <Route path={"/servicos/financeiro"} component={ServicoFinanceiro} />
          <Route path={"/servicos/nutricao"} component={ServicoNutricao} />
          <Route path={"/agendar"} component={Agendar} />
          <Route path={"/academia"} component={Academia} />
          <Route path={"/catalogo-formacao"} component={CatalogoFormacao} />
          <Route path={"/copsoq"} component={COPSOQ} />
          <Route path={"/roi"} component={ROI} />
          <Route path={"/opiniao"} component={Opiniao} />
          <Route path={"/opiniao/:slug"} component={OpiniaoPost} />
          <Route path={"/questionario/:token"} component={Questionario} />
          <Route path={"/crm/login"} component={CRMLogin} />
          <Route path={"/crm"} component={CRM} />
          <Route path={"/crm/:section"} component={CRM} />
          <Route path={"/404"} component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
          <NewsletterWidget />
          <CookieBanner />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

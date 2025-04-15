import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ComparisonPage from "@/pages/ComparisonPage";
import AboutPage from "@/pages/AboutPage";
import NewsletterAdmin from "@/pages/NewsletterAdmin";
import WalletComparisonResult from "@/components/WalletComparisonResult";
import { VisibilityProvider } from "@/hooks/use-visibility-context";
import { LanguageProvider } from "@/hooks/use-language";
import { ThemeProvider } from "@/hooks/use-theme";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ComparisonPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/compare/:wallet1/:wallet2" component={WalletComparisonResult} />
      <Route path="/admin/newsletter" component={NewsletterAdmin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <VisibilityProvider>
            <div className="min-h-screen flex flex-col bg-background">
              <Header />
              <main className="flex-grow">
                <Router />
              </main>
              <Footer />
              <Toaster />
            </div>
          </VisibilityProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

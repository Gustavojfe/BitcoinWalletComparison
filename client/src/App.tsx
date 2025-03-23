import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import ComparisonPage from "@/pages/ComparisonPage";
import AboutPage from "@/pages/AboutPage";
import WalletComparisonResult from "@/components/WalletComparisonResult";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ComparisonPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/compare/:wallet1/:wallet2" component={WalletComparisonResult} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Router />
        </main>
        <footer className="bg-white mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
              <div className="flex space-x-6 md:order-2">
                <a href="https://twitter.com/bitcoin" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Twitter</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                  </svg>
                </a>
                <a href="https://github.com/bitcoin" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">GitHub</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                  </svg>
                </a>
              </div>
              <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
                &copy; {new Date().getFullYear()} Bitcoin Wallet Comparison. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;

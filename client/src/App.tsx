import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
// Try relative path if @/ doesn't work
import { trackPageView } from "./lib/analytics";

import Landing from "@/pages/Landing";
import Calculator from "@/pages/Calculator";
import NotFound from "@/pages/not-found";


function Router() {
  const [location] = useLocation();

  // Track page views on route change
  useEffect(() => {
    trackPageView(location);
  }, [location]);

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/calculator" component={Calculator} />
      <Route component={Landing} />
    </Switch>
  );  
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AccessCode from "./components/AccessCode";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthorized, setIsAuthorized] = useState(() => {
    const hasAccessed = sessionStorage.getItem("accessGranted");
    return hasAccessed === "true";
  });

  useEffect(() => {
    if (isAuthorized) {
      sessionStorage.setItem("accessGranted", "true");
    }
  }, [isAuthorized]);

  const handleAccess = () => {
    setIsAuthorized(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!isAuthorized ? (
          <AccessCode onAccess={handleAccess} />
        ) : (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

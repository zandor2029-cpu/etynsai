import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import NanoBananaPro from "./pages/NanoBananaPro";
import KlingMotionControl from "./pages/KlingMotionControl";
import MeusRenders from "./pages/MeusRenders";
import PlansPage from "./pages/PlansPage";
import HistoricoCreditos from "./pages/HistoricoCreditos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/nano-banana-pro" element={<NanoBananaPro />} />
            <Route path="/motion-control" element={<KlingMotionControl />} />
            <Route path="/meus-renders" element={<MeusRenders />} />
            <Route path="/planos" element={<PlansPage />} />
            <Route path="/historico" element={<HistoricoCreditos />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

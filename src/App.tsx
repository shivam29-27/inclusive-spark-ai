import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import AccessibilityToolbar from "@/components/AccessibilityToolbar";
import OnScreenKeyboard from "@/components/OnScreenKeyboard";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import SignLanguageTranslator from "./pages/SignLanguageTranslator";
import EmpathyCompanion from "./pages/EmpathyCompanion";
import VoiceEmotionTranslator from "./pages/VoiceEmotionTranslator";
import VisualDescriber from "./pages/VisualDescriber";
import AccessibilityScanner from "./pages/AccessibilityScanner";
import CommunityForum from "./pages/CommunityForum";
import CleanLink from "./pages/CleanLink";
import LanguageTranslator from "./pages/LanguageTranslator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <AccessibilityProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sign-language" element={<SignLanguageTranslator />} />
            <Route path="/empathy-companion" element={<EmpathyCompanion />} />
            <Route path="/voice-emotion" element={<VoiceEmotionTranslator />} />
            <Route path="/visual-describer" element={<VisualDescriber />} />
            <Route path="/accessibility-scanner" element={<AccessibilityScanner />} />
            <Route path="/community" element={<CommunityForum />} />
            <Route path="/clean-link" element={<CleanLink />} />
            <Route path="/language-translator" element={<LanguageTranslator />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <AccessibilityToolbar />
          <OnScreenKeyboard />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AccessibilityProvider>
);

export default App;

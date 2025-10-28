import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import HomePage from "@/pages/HomePage";
import ProfessionalPortal from "@/pages/ProfessionalPortal";
import TutorPortal from "@/pages/TutorPortal";
import QuestionnairePage from "@/pages/QuestionnairePage";
import { PrivacyPolicy } from "@/pages/PrivacyPolicy";
import { TermsOfService } from "@/pages/TermsOfService";
import { DataDeletion } from "@/pages/DataDeletion";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/portal/profesional" component={ProfessionalPortal} />
      <Route path="/portal/tutor" component={TutorPortal} />
      <Route path="/cuestionario" component={QuestionnairePage} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/data-deletion" component={DataDeletion} />
      <Route>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Página no encontrada</h1>
            <p className="text-gray-600">La página que buscas no existe.</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

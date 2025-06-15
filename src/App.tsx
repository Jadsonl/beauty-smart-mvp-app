import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "./hooks/useAuth";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Agendamentos from "./pages/Agendamentos";
import Clientes from "./pages/Clientes";
import Servicos from "./pages/Servicos";
import Financeiro from "./pages/Financeiro";
import Estoque from "./pages/Estoque";
import Planos from "./pages/Planos";
import ManageSubscription from "./pages/ManageSubscription";
import Configuracoes from "./pages/Configuracoes";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import Profissionais from '@/pages/Profissionais';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppProvider>
            <Toaster />
            <Sonner />
            <Router>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/clientes" element={
                  <ProtectedRoute>
                    <Clientes />
                  </ProtectedRoute>
                } />
                <Route path="/profissionais" element={
                  <ProtectedRoute>
                    <Profissionais />
                  </ProtectedRoute>
                } />
                <Route path="/servicos" element={
                  <ProtectedRoute>
                    <Servicos />
                  </ProtectedRoute>
                } />
                <Route path="/agendamentos" element={
                  <ProtectedRoute>
                    <Agendamentos />
                  </ProtectedRoute>
                } />
                <Route path="/estoque" element={
                  <ProtectedRoute>
                    <Estoque />
                  </ProtectedRoute>
                } />
                <Route path="/financeiro" element={
                  <ProtectedRoute>
                    <Financeiro />
                  </ProtectedRoute>
                } />
                <Route path="/configuracoes" element={
                  <ProtectedRoute>
                    <Configuracoes />
                  </ProtectedRoute>
                } />
                <Route path="/planos" element={
                  <ProtectedRoute>
                    <Planos />
                  </ProtectedRoute>
                } />
                <Route path="/manage-subscription" element={
                  <ProtectedRoute>
                    <ManageSubscription />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </AppProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

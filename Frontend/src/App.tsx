import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { TransactionProvider } from "@/context/TransactionContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import SendLeafcoin from "./pages/SendLeafcoin";
import RequestLeafcoin from "./pages/RequestLeafcoin";
import QRCode from "./pages/QRCode";
import TransactionHistory from "./pages/TransactionHistory";
import Profile from "./pages/Profile";
import Rewards from "./pages/Rewards";
import Events from "./pages/Events";
import FacultyAward from "./pages/FacultyAward";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import Root from "./pages/Root";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TransactionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Root />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/send" element={<ProtectedRoute><SendLeafcoin /></ProtectedRoute>} />
              <Route path="/request" element={<ProtectedRoute><RequestLeafcoin /></ProtectedRoute>} />
              <Route path="/qr" element={<ProtectedRoute><QRCode /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
              <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
              <Route path="/faculty/credit" element={<ProtectedRoute><FacultyAward /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </TransactionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
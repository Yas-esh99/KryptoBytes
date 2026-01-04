import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { TransactionProvider } from "@/context/TransactionContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import SendCredits from "./pages/SendCredits";
import RequestCredits from "./pages/RequestCredits";
import QRCode from "./pages/QRCode";
import TransactionHistory from "./pages/TransactionHistory";
import Profile from "./pages/Profile";
import Rewards from "./pages/Rewards";
import Events from "./pages/Events";
import FacultyCredit from "./pages/FacultyCredit";
import NotFound from "./pages/NotFound";

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
              <Route path="/" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/send" element={<SendCredits />} />
              <Route path="/request" element={<RequestCredits />} />
              <Route path="/qr" element={<QRCode />} />
              <Route path="/history" element={<TransactionHistory />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/events" element={<Events />} />
              <Route path="/faculty/credit" element={<FacultyCredit />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </TransactionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
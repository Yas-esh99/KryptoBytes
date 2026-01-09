import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Send,
  History,
  QrCode,
  User,
  Gift,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Logo } from './Logo';
import { Button } from './ui/button';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Send, label: 'Send', path: '/send' },
  { icon: History, label: 'History', path: '/history' },
  { icon: QrCode, label: 'QR Code', path: '/qr' },
  { icon: Calendar, label: 'Events', path: '/events' },
  { icon: Gift, label: 'Rewards', path: '/rewards' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const facultyItems = [
  { icon: Shield, label: 'Award Leafcoin', path: '/faculty/credit' },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const allNavItems = user?.role === 'faculty' 
    ? [...navItems, ...facultyItems]
    : navItems;

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Logo size="sm" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-20"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <nav className="p-4 space-y-2">
              {allNavItems.map((item) => (
                <button
                  key={item?.path}
                  onClick={() => {
                    navigate(item?.path);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                    location.pathname === item?.path
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              <div className="pt-4 border-t border-border mt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-4 rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-300"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex-col z-50">
        <div className="p-6">
          <Logo size="md" />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {allNavItems.map((item) => (
            <button
              key={item?.path}
              onClick={() => navigate(item?.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                location.pathname === item?.path
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => navigate('/settings')}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Bottom Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border">
        <div className="flex justify-around items-center py-2">
          {[navItems[0], navItems[1], navItems[3], navItems[2], navItems[6]].map((item) => (
            <button
              key={item?.path}
              onClick={() => navigate(item?.path)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${
                location.pathname === item?.path
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
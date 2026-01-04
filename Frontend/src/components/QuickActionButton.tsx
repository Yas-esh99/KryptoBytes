import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  to: string;
  color?: string;
  delay?: number;
}

export function QuickActionButton({ icon: Icon, label, to, delay = 0 }: QuickActionButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Link
        to={to}
        className="flex flex-col items-center gap-2 group"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative w-14 h-14 md:w-16 md:h-16 bg-card/60 backdrop-blur-xl border border-primary/20 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:border-primary/50 group-hover:bg-card/80 group-hover:scale-110">
            <Icon className="w-6 h-6 md:w-7 md:h-7 text-primary transition-transform duration-300 group-hover:scale-110" />
          </div>
        </div>
        <span className="text-xs md:text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300 text-center">
          {label}
        </span>
      </Link>
    </motion.div>
  );
}
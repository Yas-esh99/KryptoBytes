import { Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-2xl' },
    lg: { icon: 48, text: 'text-4xl' },
  };

  return (
    <motion.div 
      className="flex items-center gap-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
        <div className="relative bg-primary/20 p-2 rounded-xl border border-primary/30">
          <Leaf 
            size={sizes[size].icon} 
            className="text-primary" 
            strokeWidth={2.5}
          />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-display font-bold ${sizes[size].text} gradient-text`}>
            CampusCred
          </span>
          {size === 'lg' && (
            <span className="text-xs text-muted-foreground tracking-widest uppercase">
              Powered by LeafCoin
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
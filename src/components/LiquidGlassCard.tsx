import React from 'react';
import { cn } from '@/lib/utils';

interface LiquidGlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  className,
  style
}) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/20 shadow-2xl",
        "bg-white/40 backdrop-blur-2xl",
        "before:absolute before:inset-0 before:top-20 before:bg-gradient-to-br before:from-white/10 before:via-transparent before:to-black/5 before:rounded-3xl",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
};
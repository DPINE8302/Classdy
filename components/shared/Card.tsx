
import React, { forwardRef } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ children, className = '', ...props }, ref) => {
  return (
    <div ref={ref} className={`bg-white dark:bg-zinc-800/50 rounded-2xl shadow-soft ${className}`} {...props}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';

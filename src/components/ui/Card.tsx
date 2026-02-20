import React, { HTMLAttributes } from 'react';
import { cn } from './Button';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
}

export function Card({ children, className, hover = true, ...props }: CardProps) {
    return (
        <div
            className={cn(
                'bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800 shadow-sm transition-all duration-300',
                hover && 'hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 hover:border-slate-700',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function GlassBox({ children, className, ...props }: CardProps) {
    return (
        <div
            className={cn(
                'bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl transition-all duration-500 hover:bg-white/10',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

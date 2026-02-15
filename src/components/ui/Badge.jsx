import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
    {
        variants: {
            variant: {
                default: 'bg-slate-100 text-slate-700',
                pending: 'bg-amber-100 text-amber-700',
                approved: 'bg-emerald-100 text-emerald-700',
                rejected: 'bg-red-100 text-red-700',
                live: 'bg-emerald-100 text-emerald-700',
                draft: 'bg-slate-100 text-slate-600',
                info: 'bg-blue-100 text-blue-700',
                warning: 'bg-amber-100 text-amber-700',
                success: 'bg-emerald-100 text-emerald-700',
                confirmed: 'bg-blue-100 text-blue-700',
                processing: 'bg-violet-100 text-violet-700',
                shipped: 'bg-indigo-100 text-indigo-700',
                delivered: 'bg-emerald-100 text-emerald-700',
                cancelled: 'bg-red-100 text-red-700',
                initialized: 'bg-amber-100 text-amber-700',
                out_for_delivery: 'bg-teal-100 text-teal-700',
                refunded: 'bg-rose-100 text-rose-700',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const dotColors = {
    default: 'bg-slate-500',
    pending: 'bg-amber-500',
    approved: 'bg-emerald-500',
    rejected: 'bg-red-500',
    live: 'bg-emerald-500',
    draft: 'bg-slate-400',
    info: 'bg-blue-500',
    warning: 'bg-amber-500',
    success: 'bg-emerald-500',
    confirmed: 'bg-blue-500',
    processing: 'bg-violet-500',
    shipped: 'bg-indigo-500',
    delivered: 'bg-emerald-500',
    cancelled: 'bg-red-500',
    initialized: 'bg-amber-500',
    out_for_delivery: 'bg-teal-500',
    refunded: 'bg-rose-500',
};

function Badge({ className, variant, dot, children, ...props }) {
    return (
        <span className={cn(badgeVariants({ variant }), className)} {...props}>
            {dot && (
                <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[variant || 'default'])} />
            )}
            {children}
        </span>
    );
}

export { Badge, badgeVariants };

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default:
                    "bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:ring-blue-500",
                destructive:
                    "bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-500",
                outline:
                    "border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-500",
                secondary:
                    "bg-slate-100 text-slate-700 shadow-sm hover:bg-slate-200 focus:ring-slate-500",
                ghost:
                    "text-slate-700 hover:bg-slate-100",
                link: "text-blue-600 underline-offset-4 hover:underline",
                success:
                    "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus:ring-emerald-500",
                orange:
                    "bg-amber-500 text-white shadow-sm hover:bg-amber-600 focus:ring-amber-500",
            },
            size: {
                default: "h-11 px-5 py-2.5",
                sm: "h-9 rounded-lg px-4 text-xs",
                lg: "h-12 px-6 text-base",
                xl: "h-14 px-8 text-lg",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

const Button = React.forwardRef(
    ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };

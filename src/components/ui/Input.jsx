import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(
  (
    {
      className,
      type,
      error,
      label,
      icon,
      rightElement,
      helperText,
      floatingLabel,
      value,
      onChange,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const hasValue = value !== undefined && value !== null && value !== "";

    return (
      <div className="w-full">
        {!floatingLabel && label && (
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-11 w-full rounded-lg border bg-white px-4 text-sm text-slate-900 transition-all duration-200",
              "border-slate-300 placeholder:text-slate-400",
              "hover:border-slate-400",
              "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
              icon && "pl-10",
              rightElement && "pr-28",
              error &&
                "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              floatingLabel
                ? isFocused || hasValue
                  ? "pt-5 pb-1"
                  : "py-2.5"
                : "py-2.5",
              className,
            )}
            ref={ref}
            value={value}
            onChange={onChange}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            placeholder={floatingLabel ? " " : props.placeholder}
            {...props}
          />
          {floatingLabel && label && (
            <label
              className={cn(
                "absolute left-4 transition-all duration-200 pointer-events-none text-slate-500",
                isFocused || hasValue
                  ? "top-1 text-[10px] font-medium text-blue-600"
                  : "top-3.5 text-sm",
              )}
            >
              {label}
              {props.required && <span className="ml-0.5 text-red-500">*</span>}
            </label>
          )}
          {rightElement && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 flex items-center gap-1 text-sm text-red-600">
            <svg
              className="h-4 w-4 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <label className="flex flex-col gap-1.5">
        {label && (
          <span className="text-sm text-muted-foreground">{label}</span>
        )}
        <input
          ref={ref}
          className={cn(
            "h-[52px] px-4 rounded-[16px] border bg-background text-base text-foreground outline-none transition-colors",
            "placeholder:text-muted-foreground/60",
            "focus:border-primary focus:ring-1 focus:ring-primary",
            error ? "border-destructive" : "border-border",
            className,
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-destructive mt-0.5">{error}</span>
        )}
      </label>
    );
  },
);

Input.displayName = "Input";

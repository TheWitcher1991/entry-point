import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", children, className, ...props }, ref) => {
    const styles = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/80",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
      ghost: "hover:bg-muted hover:text-foreground",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center h-12 px-7 rounded-[16px] text-base font-medium transition-[scale,background-color,border-color,opacity] duration-150 ease-out cursor-pointer active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none",
          styles[variant],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

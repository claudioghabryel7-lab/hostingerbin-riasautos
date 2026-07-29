import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-45 outline-none focus-visible:ring-2 focus-visible:ring-[var(--salmon)]/60 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--salmon)] text-[var(--ink)] hover:brightness-110 shadow-[0_10px_30px_rgba(232,111,74,0.28)]",
        secondary:
          "bg-[var(--ink-soft)] text-[var(--rice)] border border-white/10 hover:bg-white/10",
        ghost: "bg-transparent text-[var(--rice)] hover:bg-white/8",
        outline:
          "border border-white/20 bg-transparent text-[var(--rice)] hover:bg-white/8",
        danger: "bg-[#b33b2e] text-white hover:brightness-110",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
);
Button.displayName = "Button";

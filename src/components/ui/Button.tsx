/* eslint-disable react-refresh/only-export-components */
import type { PropsWithChildren } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

export const buttonClassName = cva(
  "flex items-center rounded transition-colors",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2",
        lg: "px-6 py-3 text-lg"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);

interface ButtonProps extends PropsWithChildren, React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  children,
  className,
  variant,
  size,
  ...rest
}: ButtonProps) {
  return (
    <button className={cn(buttonClassName({ variant, size, className }))} {...rest}>
      {children}
    </button>
  );
}

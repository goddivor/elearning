/* eslint-disable react-refresh/only-export-components */
import type { PropsWithChildren } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeClassName = cva(
  "inline-flex items-center font-medium rounded-full",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800",
        primary: "bg-blue-100 text-blue-800", 
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        danger: "bg-red-100 text-red-800",
        purple: "bg-purple-100 text-purple-800"
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
        lg: "px-3 py-1.5 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "sm"
    }
  }
);

interface BadgeProps extends PropsWithChildren, React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "purple";
  size?: "sm" | "md" | "lg";
}

export default function Badge({
  children,
  className,
  variant,
  size,
  ...rest
}: BadgeProps) {
  return (
    <span className={cn(badgeClassName({ variant, size, className }))} {...rest}>
      {children}
    </span>
  );
}

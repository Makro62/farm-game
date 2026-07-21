"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const VARIANT_CLASS: Record<string, string> = {
  primary: "btn-primary",
  gold: "btn-gold",
  secondary: "btn-secondary",
  danger: "btn-danger",
  wood: "btn-wood",
  ghost: "btn-ghost",
  shop: "btn-shop",
};

const SIZE_CLASS: Record<string, string> = {
  sm: "btn-size-sm",
  md: "",
  lg: "btn-size-lg",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  variant?: string;
  size?: string;
  active?: boolean;
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  active = false,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        VARIANT_CLASS[variant] || VARIANT_CLASS.primary,
        SIZE_CLASS[size],
        active && variant === "ghost" && "btn-ghost--active",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

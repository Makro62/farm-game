"use client";

import { cn } from "@/lib/utils";

const VARIANT_CLASS = {
  primary: "btn-primary",
  gold: "btn-gold",
  secondary: "btn-secondary",
  danger: "btn-danger",
  wood: "btn-wood",
  ghost: "btn-ghost",
  shop: "btn-shop",
};

const SIZE_CLASS = {
  sm: "btn-size-sm",
  md: "",
  lg: "btn-size-lg",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  active = false,
  ...props
}) {
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

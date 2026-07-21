"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ToolChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  active?: boolean;
  emoji?: ReactNode;
};

export default function ToolChip({
  children,
  active = false,
  onClick,
  className = "",
  emoji,
  type = "button",
  ...props
}: ToolChipProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn("tool-chip", active && "tool-chip--active", className)}
      {...props}
    >
      {emoji != null && <span className="tool-chip-emoji">{emoji}</span>}
      {children}
    </button>
  );
}

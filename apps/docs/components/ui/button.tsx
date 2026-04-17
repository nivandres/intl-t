import { cn } from "@/lib/utils";
import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  type?: "submit" | "button" | "reset";
}

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn("px-4 py-2 inline-flex items-center rounded-lg border cursor-pointer bg-fd-background hover:bg-fd-card", className)}
    >
      {children}
    </button>
  );
}

"use client";

import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
}

export function Switch({ checked, onCheckedChange, label, className, ...props }: SwitchProps) {
  return (
    <label className={cn("flex items-center gap-3 cursor-pointer", className)}>
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="sr-only"
          {...props}
        />
        <div
          className={cn(
            "w-11 h-6 rounded-full transition-colors duration-200",
            checked ? "bg-gray-900" : "bg-gray-300"
          )}
        >
          <div
            className={cn(
              "w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 mt-0.5",
              checked ? "translate-x-5" : "translate-x-0.5"
            )}
          />
        </div>
      </div>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  );
}

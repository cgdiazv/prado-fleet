"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type PasswordInputProps = {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
};

export function PasswordInput({
  id,
  name,
  label,
  placeholder,
  required = true,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-500">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          required={required}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm text-slate-900 outline-none transition-colors focus:border-amber-400"
          placeholder={placeholder}
        />
        <button
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 transition-colors hover:text-slate-700"
          onClick={() => setShowPassword((value) => !value)}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

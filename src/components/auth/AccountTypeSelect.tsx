"use client";

import { useState } from "react";
import { UserIcon, Briefcase } from "./icons";

const options = [
  {
    value: "planner",
    label: "Event Planner",
    description: "I'm looking for vendors",
    icon: UserIcon,
  },
  {
    value: "vendor",
    label: "Vendor",
    description: "I want to list my services",
    icon: Briefcase,
  },
] as const;

export function AccountTypeSelect() {
  const [selected, setSelected] = useState<"planner" | "vendor">("planner");

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        Account Type
      </span>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => {
          const isSelected = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelected(option.value)}
              aria-pressed={isSelected}
              className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors ${
                isSelected
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-500"
                }`}
              >
                <option.icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  {option.label}
                </span>
                <span className="block text-xs text-slate-500">
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <input type="hidden" name="accountType" value={selected} />
    </div>
  );
}

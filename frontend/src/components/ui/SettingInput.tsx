import React from "react";

interface SettingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function SettingInput({ label, className = "", ...props }: SettingInputProps) {
  const inputCls = props.disabled
    ? "w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-400 font-semibold text-xs cursor-not-allowed"
    : "w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-slate-800 font-semibold focus:outline-none focus:border-[#2563eb] text-xs transition-all";
  
  const labelCls = "font-bold text-slate-500 text-[10px] uppercase tracking-wider mb-1.5 block";

  return (
    <div className="flex flex-col gap-1">
      <label className={labelCls}>{label}</label>
      <input
        className={`${inputCls} ${className}`}
        {...props}
      />
    </div>
  );
}

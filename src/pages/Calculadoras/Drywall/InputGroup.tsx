import React from 'react';

interface InputGroupProps {
  label: string;
  value: number | string;
  onChange: (value: any) => void;
  type?: 'number' | 'select' | 'currency';
  options?: { label: string; value: number }[];
  prefix?: string;
  placeholder?: string;
  step?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  label,
  value,
  onChange,
  type = 'number',
  options,
  prefix,
  placeholder,
  step = "0.01"
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 tracking-wide">
        {label}
      </label>
      
      <div className="relative group">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <span className="text-slate-400 font-semibold">{prefix}</span>
          </div>
        )}
        
        {type === 'select' ? (
          <select
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark text-slate-900 dark:text-white rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-primary-DEFAULT/50 focus:border-primary-DEFAULT transition-all appearance-none cursor-pointer shadow-sm"
          >
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="number"
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            placeholder={placeholder}
            className={`w-full bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark text-slate-900 dark:text-white rounded-xl py-3.5 outline-none focus:ring-2 focus:ring-primary-DEFAULT/50 focus:border-primary-DEFAULT transition-all placeholder-slate-400 shadow-sm
              ${prefix ? 'pl-11 pr-4' : 'px-4'}
            `}
          />
        )}
      </div>
    </div>
  );
};
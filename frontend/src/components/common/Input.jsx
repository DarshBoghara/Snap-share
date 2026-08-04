import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = ({
  label,
  error,
  success,
  icon: Icon,
  type = 'text',
  className = '',
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 light:text-slate-600">
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          id={id}
          type={inputType}
          className={`w-full text-sm rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/30 ${
            error
              ? 'border-rose-500 focus:border-rose-500'
              : success
              ? 'border-emerald-500 focus:border-emerald-500'
              : 'border-slate-700 dark:border-slate-700 light:border-slate-300 focus:border-blue-500'
          } ${
            Icon ? 'pl-10' : 'px-4'
          } ${isPassword ? 'pr-10' : 'pr-4'} py-2.5 bg-slate-800 text-slate-100 placeholder-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 light:bg-white light:text-slate-900 light:placeholder-slate-400 ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none"
            tabIndex="-1"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-rose-500 font-medium mt-1">{error}</p>}
      {success && <p className="text-xs text-emerald-500 font-medium mt-1">{success}</p>}
    </div>
  );
};

import React from 'react';

/**
 * AuthInput — Reusable form input component for auth pages.
 * Matches the existing LoginModal input styling with icon support and error display.
 *
 * Props:
 *   label       — Input label text
 *   icon        — Lucide icon component
 *   type        — Input type (text, email, password, tel)
 *   value       — Controlled value
 *   onChange    — Change handler
 *   placeholder — Placeholder text
 *   error       — Error message string (shown below input)
 *   id          — Unique input ID
 *   ...rest     — Any additional input props
 */
export default function AuthInput({
  label,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  id,
  ...rest
}) {
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={18}
          />
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-slate-950/60 border ${
            error ? 'border-red-500/60 focus:border-red-400' : 'border-slate-800 focus:border-blue-500'
          } rounded-xl py-3 ${Icon ? 'pl-11' : 'pl-4'} pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:ring-2 ${
            error ? 'focus:ring-red-500/20' : 'focus:ring-blue-500/20'
          }`}
          {...rest}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
          {error}
        </p>
      )}
    </div>
  );
}

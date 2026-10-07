import React, { useRef, useEffect } from 'react';

/**
 * OTPInput — 6-digit OTP input component with auto-advance.
 *
 * Features:
 * - Individual digit boxes with focus auto-advance
 * - Paste support (paste full 6-digit OTP)
 * - Backspace navigates to previous input
 * - Animated focus glow matching brand blue
 *
 * Props:
 *   value    — Array of 6 strings (one per digit)
 *   onChange — Callback receiving updated array
 *   error    — Error message string
 */
export default function OTPInput({ value = ['', '', '', '', '', ''], onChange, error }) {
  const inputRefs = useRef([]);

  useEffect(() => {
    // Auto-focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, e) => {
    const val = e.target.value;

    // Only allow single digit
    if (val && !/^\d$/.test(val)) return;

    const newValue = [...value];
    newValue[index] = val;
    onChange(newValue);

    // Auto-advance to next input
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace: clear current and go back
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        const newValue = [...value];
        newValue[index - 1] = '';
        onChange(newValue);
        inputRefs.current[index - 1]?.focus();
      }
    }

    // Left arrow
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Right arrow
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    if (pasted.length > 0) {
      const newValue = [...value];
      for (let i = 0; i < 6; i++) {
        newValue[i] = pasted[i] || '';
      }
      onChange(newValue);

      // Focus the next empty input or the last one
      const nextEmpty = newValue.findIndex((v) => !v);
      const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {value.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-bold rounded-xl bg-slate-950/60 border ${
              error
                ? 'border-red-500/60'
                : digit
                ? 'border-blue-500 shadow-[0_0_12px_rgba(47,128,255,0.3)]'
                : 'border-slate-700'
            } text-white outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:shadow-[0_0_20px_rgba(47,128,255,0.4)]`}
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </div>
      {error && (
        <p className="mt-3 text-xs text-red-400 text-center flex items-center justify-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
          {error}
        </p>
      )}
    </div>
  );
}

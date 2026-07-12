"use client";

import { useState, useRef } from "react";

export default function PasswordInput({
  id,
  name,
  placeholder = "••••••••",
  required,
  autoComplete,
  defaultValue,
  value,
  onChange,
  minLength,
}: {
  id: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function toggleVisible() {
    // Preserve cursor position and typed value when switching type —
    // changing an <input>'s type normally doesn't lose the value, but
    // we explicitly restore focus + caret position for a smooth,
    // uninterrupted typing experience on both desktop and mobile.
    const input = inputRef.current;
    const caret = input?.selectionStart ?? null;
    setVisible((v) => !v);
    requestAnimationFrame(() => {
      if (input) {
        input.focus();
        if (caret !== null) input.setSelectionRange(caret, caret);
      }
    });
  }

  return (
    <div className="auth-password-wrap">
      <input
        ref={inputRef}
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        minLength={minLength}
      />
      <button
        type="button"
        className="auth-password-toggle"
        onClick={toggleVisible}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        tabIndex={-1}
      >
        {visible ? (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.4" />
            <path
              d="M10.6 5.4A10.6 10.6 0 0112 5.3c5 0 8.8 3 10.5 6.7-.6 1.3-1.4 2.5-2.4 3.6M6.7 7.1C4.6 8.5 3 10.4 1.5 12c1.7 3.7 5.5 6.7 10.5 6.7 1.4 0 2.7-.2 3.9-.7"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path d="M9.9 10a3 3 0 004.1 4.1" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <path
              d="M1.5 12C3.2 8.3 7 5.3 12 5.3s8.8 3 10.5 6.7c-1.7 3.7-5.5 6.7-10.5 6.7S3.2 15.7 1.5 12z"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        )}
      </button>
    </div>
  );
}

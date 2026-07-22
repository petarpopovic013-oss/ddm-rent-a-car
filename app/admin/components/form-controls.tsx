"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children = "Sačuvaj",
  className = "admin-button",
  name,
  value,
  confirmation,
}: {
  children?: React.ReactNode;
  className?: string;
  name?: string;
  value?: string;
  confirmation?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      name={name}
      value={value}
      onClick={(event) => {
        if (confirmation && !window.confirm(confirmation)) event.preventDefault();
      }}
    >
      {pending ? "Čuvanje…" : children}
    </button>
  );
}

export function ConfirmForm({
  action,
  message,
  children,
}: {
  action: () => void | Promise<void>;
  message: string;
  children: React.ReactNode;
}) {
  return (
    <form action={action} onSubmit={(event) => { if (!window.confirm(message)) event.preventDefault(); }}>
      {children}
    </form>
  );
}

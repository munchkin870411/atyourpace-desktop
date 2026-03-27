"use client";

import { signIn } from "next-auth/react";

export default function SignInButton({ className }: { className?: string }) {
  return (
    <button className={className} onClick={() => signIn("google")}>
      Logga in med Google
    </button>
  );
}

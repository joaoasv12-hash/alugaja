import { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}

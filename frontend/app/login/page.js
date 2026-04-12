"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/context/AuthContext";
import { loginUser } from "@/lib/api/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isHydrated } = useAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isHydrated, router]);

  const handleSubmit = async (formValues) => {
    setError("");
    setIsSubmitting(true);

    try {
      const authData = await loginUser(formValues);
      login(authData);
      router.replace("/dashboard");
    } catch (submitError) {
      setError(submitError.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page-shell auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Login</h1>
        <AuthForm
          mode="login"
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={error}
        />
        <p className="auth-footer">
          Don&apos;t have an account? <Link className="auth-link" href="/signup">Create one</Link>
        </p>
      </div>
    </main>
  );
}

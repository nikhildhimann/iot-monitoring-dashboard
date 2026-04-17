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
    // Prefetch dashboard for instant navigation
    router.prefetch('/dashboard');
    if (isHydrated && isAuthenticated) {
      router.replace('/dashboard');
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
        <div className="auth-branding">
          <img src="/icon-192.png" alt="" className="auth-logo" />
          <span className="auth-app-name">AlertSense</span>
        </div>
        
        <h1 className="auth-title">Welcome to AlertSense</h1>
        <p className="auth-subtitle">Sign in to monitor your devices</p>
        
        <AuthForm
          mode="login"
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={error}
        />
        
        <div className="auth-footer">
          Don&apos;t have an account? <Link href="/signup" className="auth-link">Sign up</Link>
        </div>
      </div>
    </main>
  );
}

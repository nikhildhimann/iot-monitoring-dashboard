"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/context/AuthContext";
import { signupUser } from "@/lib/api/auth";

export default function SignupPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
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
      await signupUser(formValues);
      router.replace("/login");
    } catch (submitError) {
      setError(submitError.message || "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page-shell auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Signup</h1>
        <AuthForm
          mode="signup"
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={error}
        />
        <p className="auth-footer">
          Already have an account? <Link className="auth-link" href="/login">Login here</Link>
        </p>
      </div>
    </main>
  );
}

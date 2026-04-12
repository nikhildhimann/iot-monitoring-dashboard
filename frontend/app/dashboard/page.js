"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import DashboardShell from "@/components/dashboard/DashboardShell";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, logout, token, user } = useAuth();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated) {
    return <main>Loading...</main>;
  }

  if (!isAuthenticated) {
    return <main>Redirecting...</main>;
  }

  return <DashboardShell token={token} user={user} onLogout={logout} />;
}

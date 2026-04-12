"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    router.replace(isAuthenticated ? "/dashboard" : "/login");
  }, [isAuthenticated, isHydrated, router]);

  return <main>Loading...</main>;
}

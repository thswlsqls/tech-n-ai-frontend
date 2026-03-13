"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Bot } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Header } from "@/components/auth/header";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/signin");
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="mb-8 text-xl font-bold tracking-tight md:text-2xl">
          Admin Dashboard
        </h1>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white brutal-border brutal-shadow p-6">
            <h2 className="mb-2 text-lg font-bold">Account Management</h2>
            <p className="mb-4 text-sm text-gray-500">
              Manage administrator accounts.
            </p>
            <Link
              href="/accounts"
              className="brutal-border brutal-shadow-sm brutal-hover inline-flex items-center gap-2 bg-[#3B82F6] px-4 py-2 text-sm font-bold text-white"
            >
              Go to Accounts
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="bg-white brutal-border brutal-shadow p-6">
            <div className="mb-2 flex items-center gap-2">
              <Bot className="size-5 text-[#3B82F6]" />
              <h2 className="text-lg font-bold">AI Agent</h2>
            </div>
            <p className="mb-4 text-sm text-gray-500">
              Run AI Agent for data collection, analysis, and monitoring.
            </p>
            <Link
              href="/agent"
              className="brutal-border brutal-shadow-sm brutal-hover inline-flex items-center gap-2 bg-[#3B82F6] px-4 py-2 text-sm font-bold text-white"
            >
              Go to Agent
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

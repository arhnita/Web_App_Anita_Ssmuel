"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Loader2, Menu } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function DashboardLayout({
  children,
  allowedRoles,
}: DashboardLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, fetchUser } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user && allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      if (user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (user.role === "MAINTENANCE_OFFICER") {
        router.push("/officer/tasks");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, allowedRoles, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-red-700" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar - always visible on lg screens */}
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
        <div className="fixed w-64 h-screen">
          <Sidebar isOpen={true} />
        </div>
      </div>

      {/* Mobile sidebar - controlled by state */}
      <div className="lg:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header with menu button */}
        <div className="lg:hidden flex items-center gap-4 p-4 bg-white border-b">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="font-semibold text-gray-800">UniMaintain</h1>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:block">
          <Header />
        </div>

        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

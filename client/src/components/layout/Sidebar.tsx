"use client";

import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  Wrench,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  // Common items
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["STUDENT", "STAFF", "MAINTENANCE_OFFICER", "ADMIN"],
  },
  // Student/Staff items
  {
    label: "My Requests",
    href: "/requests",
    icon: FileText,
    roles: ["STUDENT", "STAFF"],
  },
  {
    label: "New Request",
    href: "/requests/new",
    icon: PlusCircle,
    roles: ["STUDENT", "STAFF"],
  },
  // Officer items
  {
    label: "Assigned Tasks",
    href: "/officer/tasks",
    icon: ClipboardList,
    roles: ["MAINTENANCE_OFFICER"],
  },
  // Admin items
  {
    label: "All Requests",
    href: "/admin/requests",
    icon: FileText,
    roles: ["ADMIN"],
  },
  {
    label: "Manage Users",
    href: "/admin/users",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
    roles: ["ADMIN"],
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["ADMIN"],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { user } = useAuthStore();
  const pathname = usePathname();

  if (!user) return null;

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role),
  );

  const handleNavClick = () => {
    // Close sidebar on mobile when clicking a link
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 bg-red-800 text-white h-full",
          // Mobile: fixed positioning with slide animation
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-red-700 flex items-center justify-between flex-shrink-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
              onClick={handleNavClick}
            >
              <div className="w-10 h-10 bg-amber-800 rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">UniMaintain</h1>
                <p className="text-xs text-red-200">Request System</p>
              </div>
            </Link>
            {/* Close button for mobile */}
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-red-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="p-4 overflow-y-auto flex-1">
            <ul className="space-y-2">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={handleNavClick}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                        isActive
                          ? "bg-amber-800 text-white"
                          : "text-red-100 hover:bg-red-700",
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Role indicator */}
          <div className="p-4 border-t border-red-700 flex-shrink-0">
            <div className="px-4 py-2 bg-amber-800 rounded-lg">
              <p className="text-xs text-amber-200">Logged in as</p>
              <p className="text-sm font-medium">
                {user.role.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

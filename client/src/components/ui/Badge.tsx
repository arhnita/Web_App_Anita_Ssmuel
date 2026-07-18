"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "pending"
    | "assigned"
    | "in-progress"
    | "completed"
    | "cancelled";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-gray-100 text-gray-800",
      success: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
      error: "bg-red-100 text-red-800",
      info: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      assigned: "bg-blue-100 text-blue-800",
      "in-progress": "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
          variants[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Badge.displayName = "Badge";

// Helper component for status badges
interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusMap: Record<
    string,
    { variant: BadgeProps["variant"]; label: string }
  > = {
    PENDING: { variant: "pending", label: "Pending" },
    ASSIGNED: { variant: "assigned", label: "Assigned" },
    IN_PROGRESS: { variant: "in-progress", label: "In Progress" },
    COMPLETED: { variant: "completed", label: "Completed" },
    CANCELLED: { variant: "cancelled", label: "Cancelled" },
  };

  const config = statusMap[status] || { variant: "default", label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

// Helper component for priority badges
interface PriorityBadgeProps {
  priority: string;
}

const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  const priorityMap: Record<string, { className: string; label: string }> = {
    LOW: { className: "bg-gray-100 text-gray-700", label: "Low" },
    MEDIUM: { className: "bg-blue-100 text-blue-700", label: "Medium" },
    HIGH: { className: "bg-orange-100 text-orange-700", label: "High" },
    URGENT: { className: "bg-red-100 text-red-700", label: "Urgent" },
  };

  const config = priorityMap[priority] || {
    className: "bg-gray-100 text-gray-700",
    label: priority,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
};

// Helper component for role badges
interface RoleBadgeProps {
  role: string;
}

const RoleBadge = ({ role }: RoleBadgeProps) => {
  const roleMap: Record<
    string,
    { variant: BadgeProps["variant"]; label: string }
  > = {
    STUDENT: { variant: "info", label: "Student" },
    STAFF: { variant: "info", label: "Staff" },
    MAINTENANCE_OFFICER: { variant: "warning", label: "Officer" },
    ADMIN: { variant: "error", label: "Admin" },
  };

  const config = roleMap[role] || { variant: "default", label: role };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export { Badge, StatusBadge, PriorityBadge, RoleBadge };

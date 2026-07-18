"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  StatusBadge,
  PriorityBadge,
} from "@/components/ui";
import { adminApi } from "@/lib/api";
import { DashboardStats, ServiceRequest } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import {
  Users,
  FileText,
  Wrench,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await adminApi.getDashboard();
        setStats(response.data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const overviewCards = stats
    ? [
        {
          title: "Total Users",
          value: stats.overview.totalUsers,
          icon: Users,
          color: "text-blue-600",
          bg: "bg-blue-100",
        },
        {
          title: "Total Requests",
          value: stats.overview.totalRequests,
          icon: FileText,
          color: "text-purple-600",
          bg: "bg-purple-100",
        },
        {
          title: "Officers",
          value: stats.overview.totalOfficers,
          icon: Wrench,
          color: "text-amber-600",
          bg: "bg-amber-100",
        },
        {
          title: "Pending",
          value: stats.overview.pendingRequests,
          icon: Clock,
          color: "text-yellow-600",
          bg: "bg-yellow-100",
        },
        {
          title: "In Progress",
          value:
            stats.overview.assignedRequests + stats.overview.inProgressRequests,
          icon: AlertCircle,
          color: "text-orange-600",
          bg: "bg-orange-100",
        },
        {
          title: "Completed",
          value: stats.overview.completedRequests,
          icon: CheckCircle,
          color: "text-green-600",
          bg: "bg-green-100",
        },
      ]
    : [];

  return (
    <DashboardLayout allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-gray-500">System overview and quick actions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-12"></div>
                  </CardContent>
                </Card>
              ))
            : overviewCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.title}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}
                        >
                          <Icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {stat.value}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Requests by Category */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Requests by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse flex items-center gap-4"
                    >
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.requestsByCategory.map((cat) => {
                    const maxCount = Math.max(
                      ...(stats?.requestsByCategory.map((c) => c.count) || [1]),
                    );
                    const percentage = (cat.count / maxCount) * 100;
                    return (
                      <div key={cat.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">
                            {cat.name}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {cat.count}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-700 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Requests by Priority */}
          <Card>
            <CardHeader>
              <CardTitle>Requests by Priority</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse p-4 bg-gray-100 rounded-lg"
                    >
                      <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-8"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {stats?.requestsByPriority.map((p) => (
                    <div
                      key={p.priority}
                      className={`p-4 rounded-lg ${
                        p.priority === "URGENT"
                          ? "bg-red-50 border border-red-200"
                          : p.priority === "HIGH"
                            ? "bg-orange-50 border border-orange-200"
                            : p.priority === "MEDIUM"
                              ? "bg-blue-50 border border-blue-200"
                              : "bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <p className="text-sm text-gray-600">{p.priority}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {p._count.priority}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Requests</CardTitle>
            <Link
              href="/admin/requests"
              className="text-sm text-red-700 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse flex items-center gap-4 py-3"
                  >
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : stats?.recentRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent requests
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {stats?.recentRequests.map((request: ServiceRequest) => (
                  <Link
                    key={request.id}
                    href={`/admin/requests?id=${request.id}`}
                    className="block py-4 hover:bg-gray-50 -mx-6 px-6 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 truncate">
                            {request.title}
                          </p>
                          <PriorityBadge priority={request.priority} />
                        </div>
                        <p className="text-sm text-gray-500">
                          {request.user?.firstName} {request.user?.lastName} •{" "}
                          {request.location}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-4">
                        <StatusBadge status={request.status} />
                        <span className="text-xs text-gray-400">
                          {formatRelativeTime(request.createdAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/requests">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-red-700" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Manage Requests</p>
                  <p className="text-sm text-gray-500">
                    View and assign requests
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Manage Users</p>
                  <p className="text-sm text-gray-500">Add and manage users</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/reports">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Reports</p>
                  <p className="text-sm text-gray-500">
                    Analytics and insights
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

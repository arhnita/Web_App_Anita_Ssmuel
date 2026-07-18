"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { DashboardLayout } from "@/components/layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  StatusBadge,
  PriorityBadge,
} from "@/components/ui";
import { requestsApi, categoriesApi } from "@/lib/api";
import { ServiceRequest, RequestCategory } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [categories, setCategories] = useState<RequestCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requestsRes, categoriesRes] = await Promise.all([
          requestsApi.getMyRequests({ limit: 5 }),
          categoriesApi.getAll(),
        ]);

        const requestsData = requestsRes.data.data.requests || [];
        setRequests(requestsData);
        setCategories(categoriesRes.data.data || []);

        // Calculate stats
        const allRequestsRes = await requestsApi.getMyRequests({ limit: 100 });
        const allRequests = allRequestsRes.data.data.requests || [];

        setStats({
          total: allRequests.length,
          pending: allRequests.filter(
            (r: ServiceRequest) => r.status === "PENDING",
          ).length,
          inProgress: allRequests.filter(
            (r: ServiceRequest) =>
              r.status === "ASSIGNED" || r.status === "IN_PROGRESS",
          ).length,
          completed: allRequests.filter(
            (r: ServiceRequest) => r.status === "COMPLETED",
          ).length,
        });
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: "Total Requests",
      value: stats.total,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: AlertCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  return (
    <DashboardLayout allowedRoles={["STUDENT", "STAFF"]}>
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-500">
              Overview of your maintenance requests
            </p>
          </div>
          <Link
            href="/requests/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            New Request
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {loading ? "-" : stat.value}
                      </p>
                    </div>
                    <div
                      className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}
                    >
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Requests</CardTitle>
            <Link
              href="/requests"
              className="text-sm text-red-700 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No requests yet</p>
                <Link
                  href="/requests/new"
                  className="text-red-700 hover:underline text-sm mt-2 inline-block"
                >
                  Submit your first request
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {requests.map((request) => (
                  <Link
                    key={request.id}
                    href={`/requests/${request.id}`}
                    className="block py-4 hover:bg-gray-50 -mx-6 px-6 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {request.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {request.location} • {request.category?.name}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-4">
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

        {/* Quick Category Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle>Submit a Request</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  href={`/requests/new?category=${category.id}`}
                  className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-center group"
                >
                  <div className="text-2xl mb-2">{category.icon || "🔧"}</div>
                  <p className="text-sm font-medium text-gray-700 group-hover:text-red-700">
                    {category.name}
                  </p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

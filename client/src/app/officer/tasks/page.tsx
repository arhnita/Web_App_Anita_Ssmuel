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
  Button,
} from "@/components/ui";
import { requestsApi } from "@/lib/api";
import { ServiceRequest } from "@/types";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  PlayCircle,
  MapPin,
  User,
} from "lucide-react";

export default function OfficerTasksPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [updating, setUpdating] = useState<string | null>(null);

  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      const params: { limit: number; status?: string } = { limit: 50 };
      if (filter !== "ALL") {
        params.status = filter;
      }
      const response = await requestsApi.getAssigned(params);
      const tasksData = response.data.data.requests || [];
      setRequests(tasksData);

      // Get all tasks for stats
      const allResponse = await requestsApi.getAssigned({ limit: 100 });
      const allTasks = allResponse.data.data.requests || [];

      setStats({
        assigned: allTasks.filter(
          (r: ServiceRequest) => r.status === "ASSIGNED",
        ).length,
        inProgress: allTasks.filter(
          (r: ServiceRequest) => r.status === "IN_PROGRESS",
        ).length,
        completed: allTasks.filter(
          (r: ServiceRequest) => r.status === "COMPLETED",
        ).length,
      });
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    requestId: string,
    newStatus: string,
    comments?: string,
  ) => {
    setUpdating(requestId);
    try {
      await requestsApi.updateStatus(requestId, newStatus, comments);
      fetchTasks();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const statusOptions = [
    { value: "ALL", label: "All Tasks" },
    { value: "ASSIGNED", label: "Assigned" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "COMPLETED", label: "Completed" },
  ];

  const statCards = [
    {
      title: "Assigned",
      value: stats.assigned,
      icon: ClipboardList,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: PlayCircle,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
    },
  ];

  return (
    <DashboardLayout allowedRoles={["MAINTENANCE_OFFICER"]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
          <p className="text-gray-500">
            Manage your assigned maintenance tasks
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}
                    >
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-gray-200 pb-4">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === option.value
                  ? "bg-red-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                Loading tasks...
              </CardContent>
            </Card>
          ) : requests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No tasks found</p>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Task Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusBadge status={request.status} />
                        <PriorityBadge priority={request.priority} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {request.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {request.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {request.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {request.user?.firstName} {request.user?.lastName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatRelativeTime(request.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:items-end">
                      {request.status === "ASSIGNED" && (
                        <Button
                          onClick={() =>
                            updateStatus(
                              request.id,
                              "IN_PROGRESS",
                              "Started working on this task",
                            )
                          }
                          isLoading={updating === request.id}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Start Task
                        </Button>
                      )}
                      {request.status === "IN_PROGRESS" && (
                        <Button
                          onClick={() =>
                            updateStatus(
                              request.id,
                              "COMPLETED",
                              "Task completed successfully",
                            )
                          }
                          isLoading={updating === request.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Complete
                        </Button>
                      )}
                      {request.status === "COMPLETED" && (
                        <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Requester Contact */}
                  {(request.status === "ASSIGNED" ||
                    request.status === "IN_PROGRESS") &&
                    request.user && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">
                          Requester Contact:
                        </p>
                        <p className="text-sm">
                          {request.user.email}
                          {request.user.phone && ` • ${request.user.phone}`}
                          {request.user.department &&
                            ` • ${request.user.department}`}
                        </p>
                      </div>
                    )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const requestId = params.id as string;

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await requestsApi.getById(requestId);
        setRequest(response.data.data);
      } catch (err: unknown) {
        const errorMessage =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to load request details";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchRequest();
    }
  }, [requestId]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this request?")) return;

    setCancelling(true);
    try {
      await requestsApi.updateStatus(
        requestId,
        "CANCELLED",
        "Cancelled by user",
      );
      setRequest((prev) => (prev ? { ...prev, status: "CANCELLED" } : null));
    } catch (err) {
      console.error("Failed to cancel request:", err);
      alert("Failed to cancel request");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-700 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !request) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {error || "Request not found"}
              </h2>
              <Link href="/requests">
                <Button variant="outline">Back to Requests</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/requests"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Requests
        </Link>

        <div className="grid gap-6">
          {/* Main Info */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <StatusBadge status={request.status} />
                  <PriorityBadge priority={request.priority} />
                </div>
                <CardTitle className="text-2xl">{request.title}</CardTitle>
              </div>
              {request.status === "PENDING" && request.userId === user?.id && (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  isLoading={cancelling}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Description
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {request.description}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Location
                    </p>
                    <p className="text-gray-900">{request.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Category
                    </p>
                    <p className="text-gray-900">
                      {request.category?.name || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Submitted
                    </p>
                    <p className="text-gray-900">
                      {formatDateTime(request.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Last Updated
                    </p>
                    <p className="text-gray-900">
                      {formatRelativeTime(request.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Info */}
          {request.assignments && request.assignments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assigned To</CardTitle>
              </CardHeader>
              <CardContent>
                {request.assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-900 rounded-full flex items-center justify-center text-white font-medium">
                      {assignment.officer?.firstName?.[0]}
                      {assignment.officer?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {assignment.officer?.firstName}{" "}
                        {assignment.officer?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {assignment.officer?.email} •{" "}
                        {assignment.officer?.phone || "No phone"}
                      </p>
                      {assignment.notes && (
                        <p className="text-sm text-gray-600 mt-1">
                          Note: {assignment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Status History */}
          {request.statusLogs && request.statusLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-6">
                    {request.statusLogs.map((log, index) => (
                      <div key={log.id} className="relative flex gap-4 pl-10">
                        <div
                          className={`absolute left-2 w-5 h-5 rounded-full flex items-center justify-center 
                          ${index === 0 ? "bg-red-700" : "bg-gray-300"}`}
                        >
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={log.newStatus} />
                            <span className="text-xs text-gray-400">
                              from {log.previousStatus.replace("_", " ")}
                            </span>
                          </div>
                          {log.comments && (
                            <p className="text-sm text-gray-600 mt-1">
                              {log.comments}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {log.changedBy?.firstName} {log.changedBy?.lastName}{" "}
                            • {formatDateTime(log.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

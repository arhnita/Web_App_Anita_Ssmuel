"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@/components/ui";
import { adminApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  Download,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
} from "lucide-react";

interface ReportData {
  period: { startDate: string; endDate: string };
  summary: {
    totalRequests: number;
    completedRequests: number;
    pendingRequests: number;
    averageCompletionTime: string;
    completionRate: string;
  };
  requestsByCategory: Array<{ name: string; count: number }>;
  requestsByPriority: Array<{ priority: string; count: number }>;
  requestsByStatus: Array<{ status: string; count: number }>;
  topOfficers: Array<{
    firstName: string;
    lastName: string;
    completedCount: number;
  }>;
}

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getReports({ startDate, endDate });
      setReportData(response.data.data);
    } catch (error) {
      console.error("Failed to fetch report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    fetchReport();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-500",
      ASSIGNED: "bg-blue-500",
      IN_PROGRESS: "bg-purple-500",
      COMPLETED: "bg-green-500",
      CANCELLED: "bg-gray-500",
    };
    return colors[status] || "bg-gray-400";
  };

  return (
    <DashboardLayout allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Reports & Analytics
            </h2>
            <p className="text-gray-500">
              View system statistics and generate reports
            </p>
          </div>
        </div>

        {/* Date Range Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>
              <Button onClick={handleGenerateReport} isLoading={loading}>
                <Calendar className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reportData && reportData.summary ? (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500">Total Requests</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {reportData.summary.totalRequests}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {reportData.summary.completedRequests}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">
                    {reportData.summary.pendingRequests}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500">Completion Rate</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {reportData.summary.completionRate}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500">Avg. Completion Time</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {reportData.summary.averageCompletionTime}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Requests by Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-gray-400" />
                    Requests by Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.requestsByStatus.map((item) => {
                      const total = reportData.summary.totalRequests || 1;
                      const percentage = ((item.count / total) * 100).toFixed(
                        1,
                      );
                      return (
                        <div key={item.status}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600 capitalize">
                              {item.status.replace("_", " ").toLowerCase()}
                            </span>
                            <span className="text-sm font-medium">
                              {item.count} ({percentage}%)
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getStatusColor(item.status)} rounded-full`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Requests by Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                    Requests by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.requestsByCategory.map((cat) => {
                      const maxCount = Math.max(
                        ...reportData.requestsByCategory.map((c) => c.count),
                        1,
                      );
                      const percentage = (cat.count / maxCount) * 100;
                      return (
                        <div key={cat.name}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">
                              {cat.name}
                            </span>
                            <span className="text-sm font-medium">
                              {cat.count}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-700 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Requests by Priority */}
              <Card>
                <CardHeader>
                  <CardTitle>Requests by Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {reportData.requestsByPriority.map((p) => (
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
                          {p.count}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Officers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                    Top Performing Officers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reportData.topOfficers.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No data available
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {reportData.topOfficers.map((officer, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                              index === 0
                                ? "bg-yellow-500"
                                : index === 1
                                  ? "bg-gray-400"
                                  : index === 2
                                    ? "bg-amber-600"
                                    : "bg-gray-300"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {officer.firstName} {officer.lastName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              {officer.completedCount}
                            </p>
                            <p className="text-xs text-gray-500">completed</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              No report data available. Try generating a report.
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

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
import { formatDate } from "@/lib/utils";
import { FileText, PlusCircle, Filter, Search } from "lucide-react";
import Link from "next/link";

export default function RequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const params: { limit: number; status?: string } = { limit: 50 };
        if (filter !== "ALL") {
          params.status = filter;
        }
        const response = await requestsApi.getMyRequests(params);
        setRequests(response.data.data.requests || []);
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [filter]);

  const filteredRequests = requests.filter(
    (request) =>
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const statusOptions = [
    { value: "ALL", label: "All Status" },
    { value: "PENDING", label: "Pending" },
    { value: "ASSIGNED", label: "Assigned" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <DashboardLayout allowedRoles={["STUDENT", "STAFF"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Requests</h2>
            <p className="text-gray-500">Manage your maintenance requests</p>
          </div>
          <Link href="/requests/new">
            <Button>
              <PlusCircle className="w-5 h-5 mr-2" />
              New Request
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-white"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filter === "ALL"
                ? "All Requests"
                : `${filter.replace("_", " ")} Requests`}
              <span className="text-gray-400 font-normal ml-2">
                ({filteredRequests.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No requests found</p>
                <Link href="/requests/new">
                  <Button variant="outline">Create New Request</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Title
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Location
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Category
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Priority
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr
                        key={request.id}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() =>
                          (window.location.href = `/requests/${request.id}`)
                        }
                      >
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">
                            {request.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {request.description}
                          </p>
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {request.location}
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {request.category?.name || "-"}
                        </td>
                        <td className="py-4 px-4">
                          <PriorityBadge priority={request.priority} />
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status={request.status} />
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          {formatDate(request.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

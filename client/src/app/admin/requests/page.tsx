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
import { requestsApi, adminApi, usersApi } from "@/lib/api";
import { ServiceRequest, User } from "@/types";
import { formatDate } from "@/lib/utils";
import { Search, Filter, UserPlus, X, Loader2 } from "lucide-react";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [officers, setOfficers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Assignment modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null,
  );
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [assignNotes, setAssignNotes] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      const [requestsRes, officersRes] = await Promise.all([
        requestsApi.getAll({
          limit: 50,
          status: filter !== "ALL" ? filter : undefined,
        }),
        usersApi.getOfficers(),
      ]);

      setRequests(requestsRes.data.data.requests || []);
      setOfficers(officersRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(
    (request) =>
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAssign = async () => {
    if (!selectedRequest || !selectedOfficer) return;

    setAssigning(true);
    try {
      await adminApi.assignRequest(
        selectedRequest.id,
        selectedOfficer,
        assignNotes,
      );
      setShowAssignModal(false);
      setSelectedRequest(null);
      setSelectedOfficer("");
      setAssignNotes("");
      fetchData();
    } catch (error) {
      console.error("Failed to assign request:", error);
      alert("Failed to assign request");
    } finally {
      setAssigning(false);
    }
  };

  const statusOptions = [
    { value: "ALL", label: "All Status" },
    { value: "PENDING", label: "Pending" },
    { value: "ASSIGNED", label: "Assigned" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <DashboardLayout allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Requests</h2>
          <p className="text-gray-500">
            Manage and assign maintenance requests
          </p>
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
                  placeholder="Search by title, location, or user..."
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

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Requests
              <span className="text-gray-400 font-normal ml-2">
                ({filteredRequests.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No requests found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Request
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Submitted By
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Priority
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Assigned To
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr
                        key={request.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">
                            {request.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {request.location}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-900">
                            {request.user?.firstName} {request.user?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {request.user?.email}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <PriorityBadge priority={request.priority} />
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status={request.status} />
                        </td>
                        <td className="py-4 px-4">
                          {request.assignments &&
                          request.assignments.length > 0 ? (
                            <span className="text-gray-900">
                              {request.assignments[0].officer?.firstName}{" "}
                              {request.assignments[0].officer?.lastName}
                            </span>
                          ) : (
                            <span className="text-gray-400">Unassigned</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          {formatDate(request.createdAt)}
                        </td>
                        <td className="py-4 px-4">
                          {request.status === "PENDING" && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowAssignModal(true);
                              }}
                            >
                              <UserPlus className="w-4 h-4 mr-1" />
                              Assign
                            </Button>
                          )}
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

      {/* Assignment Modal */}
      {showAssignModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Assign Request</CardTitle>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedRequest(null);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Request:</p>
                <p className="font-medium">{selectedRequest.title}</p>
                <p className="text-sm text-gray-500">
                  {selectedRequest.location}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Officer *
                </label>
                <select
                  value={selectedOfficer}
                  onChange={(e) => setSelectedOfficer(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="">Select an officer</option>
                  {officers.map((officer) => (
                    <option key={officer.id} value={officer.id}>
                      {officer.firstName} {officer.lastName} ({officer.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="Add any notes for the officer..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedRequest(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssign}
                  disabled={!selectedOfficer}
                  isLoading={assigning}
                >
                  Assign Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@/components/ui";
import { requestsApi, categoriesApi } from "@/lib/api";
import { RequestCategory } from "@/types";
import { AlertCircle, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

const requestSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

type RequestFormData = z.infer<typeof requestSchema>;

function NewRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<RequestCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      priority: "MEDIUM",
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesApi.getAll();
        setCategories(response.data.data || []);

        // Set category from URL if present
        const categoryFromUrl = searchParams.get("category");
        if (categoryFromUrl) {
          setValue("categoryId", categoryFromUrl);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, [searchParams, setValue]);

  const onSubmit = async (data: RequestFormData) => {
    setLoading(true);
    setError(null);

    try {
      await requestsApi.create(data);
      setSuccess(true);
      setTimeout(() => {
        router.push("/requests");
      }, 2000);
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to submit request. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions = [
    { value: "LOW", label: "Low", description: "Can wait a few days" },
    {
      value: "MEDIUM",
      label: "Medium",
      description: "Should be addressed soon",
    },
    { value: "HIGH", label: "High", description: "Needs prompt attention" },
    {
      value: "URGENT",
      label: "Urgent",
      description: "Requires immediate action",
    },
  ];

  if (success) {
    return (
      <DashboardLayout allowedRoles={["STUDENT", "STAFF"]}>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Request Submitted!
              </h2>
              <p className="text-gray-500 mb-6">
                Your maintenance request has been submitted successfully. You
                will be notified when there are updates.
              </p>
              <p className="text-sm text-gray-400">
                Redirecting to your requests...
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={["STUDENT", "STAFF"]}>
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link
          href="/requests"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Requests
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Submit a Maintenance Request</CardTitle>
            <p className="text-gray-500 text-sm mt-1">
              Fill out the form below to report a maintenance issue
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  {...register("title")}
                  type="text"
                  placeholder="e.g., Broken air conditioner in Room 203"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  {...register("categoryId")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  {...register("location")}
                  type="text"
                  placeholder="e.g., Building A, Room 203"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.location.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  placeholder="Please describe the issue in detail. Include any relevant information that might help the maintenance team."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {priorityOptions.map((option) => (
                    <label key={option.value} className="relative">
                      <input
                        {...register("priority")}
                        type="radio"
                        value={option.value}
                        className="peer sr-only"
                      />
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors 
                        peer-checked:border-red-700 peer-checked:bg-red-50 hover:bg-gray-50
                        ${option.value === "URGENT" ? "peer-checked:border-red-600" : ""}
                        ${option.value === "HIGH" ? "peer-checked:border-orange-600" : ""}
                        ${option.value === "MEDIUM" ? "peer-checked:border-blue-600" : ""}
                        ${option.value === "LOW" ? "peer-checked:border-gray-600" : ""}
                      `}
                      >
                        <p className="font-medium">{option.label}</p>
                        <p className="text-xs text-gray-500">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.priority && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.priority.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-4 pt-4">
                <Link href="/requests">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" isLoading={loading}>
                  Submit Request
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function NewRequestPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout allowedRoles={["STUDENT", "STAFF"]}>
          <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-10 h-10 animate-spin text-red-700" />
          </div>
        </DashboardLayout>
      }
    >
      <NewRequestForm />
    </Suspense>
  );
}

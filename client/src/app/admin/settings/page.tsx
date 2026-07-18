'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { categoriesApi } from '@/lib/api';
import { RequestCategory } from '@/types';
import { Settings, Tag, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [categories, setCategories] = useState<RequestCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesApi.getAll();
        setCategories(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-500">System configuration and categories</p>
        </div>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-400" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Application Name</p>
                  <p className="font-medium text-gray-900">UniMaintain</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Version</p>
                  <p className="font-medium text-gray-900">1.0.0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Environment</p>
                  <p className="font-medium text-gray-900">Development</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Database Status</p>
                  <p className="font-medium text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Connected
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">API Endpoint</p>
                  <p className="font-medium text-gray-900 text-sm font-mono">
                    {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-gray-400" />
              Request Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No categories found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Run the database seed to create default categories
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-red-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon || '🔧'}</span>
                      <div>
                        <p className="font-medium text-gray-900">{category.name}</p>
                        <p className="text-sm text-gray-500">
                          {category.description || 'No description'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        category.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {category._count && (
                        <span className="text-sm text-gray-500">
                          {category._count.requests || 0} requests
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                <h4 className="font-medium text-red-900">Seed Database</h4>
                <p className="text-sm text-red-700 mt-1">
                  Run <code className="bg-red-100 px-1 rounded">npm run seed</code> in the server directory to populate sample data.
                </p>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                <h4 className="font-medium text-amber-900">Reset Data</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Use Prisma Studio with <code className="bg-amber-100 px-1 rounded">npx prisma studio</code> to manage data.
                </p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <h4 className="font-medium text-blue-900">Documentation</h4>
                <p className="text-sm text-blue-700 mt-1">
                  API docs available at <code className="bg-blue-100 px-1 rounded">/api-docs</code> endpoint.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// Use production URL or fallback to localhost for development
const API_URL = process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? 'https://web-app-anita-ssmuel.onrender.com/api'
        : 'http://localhost:5000/api');

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds for remote database
    withCredentials: true, // Enable cross-origin cookies
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = Cookies.get('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login
            Cookies.remove('token');
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),

    register: (data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
        department?: string;
        role: 'STUDENT' | 'STAFF';
    }) => api.post('/auth/register', data),

    getMe: () => api.get('/auth/me'),

    updateProfile: (data: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        department?: string;
    }) => api.put('/auth/profile', data),

    changePassword: (currentPassword: string, newPassword: string) =>
        api.put('/auth/change-password', { currentPassword, newPassword }),
};

// Requests API
export const requestsApi = {
    getAll: (params?: {
        page?: number;
        limit?: number;
        status?: string;
        priority?: string;
        categoryId?: string;
        search?: string;
    }) => api.get('/requests', { params }),

    getMyRequests: (params?: { page?: number; limit?: number; status?: string }) =>
        api.get('/requests/my-requests', { params }),

    getAssigned: (params?: { page?: number; limit?: number; status?: string }) =>
        api.get('/requests/assigned', { params }),

    getById: (id: string) => api.get(`/requests/${id}`),

    create: (data: {
        title: string;
        description: string;
        location: string;
        categoryId: string;
        priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
        imageUrl?: string;
    }) => api.post('/requests', data),

    update: (id: string, data: {
        title?: string;
        description?: string;
        location?: string;
        priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    }) => api.put(`/requests/${id}`, data),

    updateStatus: (id: string, status: string, comments?: string) =>
        api.put(`/requests/${id}/status`, { status, comments }),

    delete: (id: string) => api.delete(`/requests/${id}`),
};

// Categories API
export const categoriesApi = {
    getAll: () => api.get('/categories'),
    getById: (id: string) => api.get(`/categories/${id}`),
};

// Admin API
export const adminApi = {
    getDashboard: () => api.get('/admin/dashboard'),

    getUsers: (params?: { page?: number; limit?: number; role?: string; search?: string }) =>
        api.get('/admin/users', { params }),

    createUser: (data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: string;
        phone?: string;
        department?: string;
    }) => api.post('/admin/users', data),

    updateUserRole: (id: string, role: string) =>
        api.put(`/admin/users/${id}/role`, { role }),

    assignRequest: (requestId: string, officerId: string, notes?: string) =>
        api.post(`/admin/requests/${requestId}/assign`, { officerId, notes }),

    getReports: (params?: { startDate?: string; endDate?: string }) =>
        api.get('/admin/reports', { params }),
};

// Users API (for getting officers list)
export const usersApi = {
    getOfficers: () => api.get('/users/officers'),
};

export default api;

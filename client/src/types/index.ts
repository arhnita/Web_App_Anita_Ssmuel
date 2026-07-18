// TypeScript types for the application

export type Role = 'STUDENT' | 'STAFF' | 'MAINTENANCE_OFFICER' | 'ADMIN';
export type RequestStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    department?: string;
    role: Role;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    _count?: {
        requests: number;
        assignmentsAsOfficer?: number;
    };
}

export interface RequestCategory {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    isActive: boolean;
    createdAt: string;
    _count?: {
        requests: number;
    };
}

export interface ServiceRequest {
    id: string;
    title: string;
    description: string;
    location: string;
    priority: Priority;
    status: RequestStatus;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    categoryId: string;
    user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'department' | 'phone'>;
    category?: RequestCategory;
    assignments?: Assignment[];
    statusLogs?: StatusLog[];
    _count?: {
        statusLogs: number;
    };
}

export interface Assignment {
    id: string;
    notes?: string;
    assignedAt: string;
    requestId: string;
    officerId: string;
    assignedById: string;
    officer?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'phone'>;
    assignedBy?: Pick<User, 'id' | 'firstName' | 'lastName'>;
}

export interface StatusLog {
    id: string;
    previousStatus: RequestStatus;
    newStatus: RequestStatus;
    comments?: string;
    createdAt: string;
    requestId: string;
    changedById: string;
    changedBy?: Pick<User, 'id' | 'firstName' | 'lastName' | 'role'>;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: {
        requests?: T[];
        users?: T[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    };
}

export interface DashboardStats {
    overview: {
        totalUsers: number;
        totalRequests: number;
        totalOfficers: number;
        pendingRequests: number;
        assignedRequests: number;
        inProgressRequests: number;
        completedRequests: number;
        cancelledRequests: number;
    };
    requestsByCategory: Array<{ name: string; count: number }>;
    requestsByPriority: Array<{ priority: Priority; _count: { priority: number } }>;
    recentRequests: ServiceRequest[];
}

// Form types
export interface LoginFormData {
    email: string;
    password: string;
}

export interface RegisterFormData {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone?: string;
    department?: string;
    role: 'STUDENT' | 'STAFF';
}

export interface CreateRequestFormData {
    title: string;
    description: string;
    location: string;
    categoryId: string;
    priority: Priority;
    imageUrl?: string;
}

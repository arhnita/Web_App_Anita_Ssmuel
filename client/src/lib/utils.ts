import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format date to human readable string
 */
export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return formatDate(date);
}

/**
 * Get status badge class based on request status
 */
export function getStatusBadgeClass(status: string): string {
    const statusClasses: Record<string, string> = {
        PENDING: 'badge-pending',
        ASSIGNED: 'badge-assigned',
        IN_PROGRESS: 'badge-in-progress',
        COMPLETED: 'badge-completed',
        CANCELLED: 'badge-cancelled',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get priority badge class based on priority level
 */
export function getPriorityBadgeClass(priority: string): string {
    const priorityClasses: Record<string, string> = {
        LOW: 'priority-low',
        MEDIUM: 'priority-medium',
        HIGH: 'priority-high',
        URGENT: 'priority-urgent',
    };
    return priorityClasses[priority] || 'bg-gray-100 text-gray-700';
}

/**
 * Format status for display
 */
export function formatStatus(status: string): string {
    return status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
}

/**
 * Get user initials for avatar
 */
export function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Format role for display
 */
export function formatRole(role: string): string {
    const roleLabels: Record<string, string> = {
        STUDENT: 'Student',
        STAFF: 'Staff',
        MAINTENANCE_OFFICER: 'Maintenance Officer',
        ADMIN: 'Administrator',
    };
    return roleLabels[role] || role;
}

/**
 * Check if user can manage requests (admin or officer)
 */
export function canManageRequests(role: string): boolean {
    return role === 'ADMIN' || role === 'MAINTENANCE_OFFICER';
}

/**
 * Check if user is admin
 */
export function isAdmin(role: string): boolean {
    return role === 'ADMIN';
}

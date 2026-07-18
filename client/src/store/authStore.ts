import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';
import { User } from '@/types';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    register: (data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
        department?: string;
        role: 'STUDENT' | 'STAFF';
    }) => Promise<void>;
    logout: () => void;
    fetchUser: () => Promise<void>;
    updateUser: (user: Partial<User>) => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,

            login: async (email: string, password: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authApi.login(email, password);
                    const { user, token } = response.data.data;

                    // Set token in cookie for API interceptor
                    Cookies.set('token', token, { expires: 7 });

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                } catch (error: unknown) {
                    const errorMessage =
                        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                        'Login failed. Please try again.';
                    set({ isLoading: false, error: errorMessage });
                    throw new Error(errorMessage);
                }
            },

            register: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authApi.register(data);
                    const { user, token } = response.data.data;

                    // Set token in cookie for API interceptor
                    Cookies.set('token', token, { expires: 7 });

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                } catch (error: unknown) {
                    const errorMessage =
                        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                        'Registration failed. Please try again.';
                    set({ isLoading: false, error: errorMessage });
                    throw new Error(errorMessage);
                }
            },

            logout: () => {
                Cookies.remove('token');
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null,
                });
            },

            fetchUser: async () => {
                const token = Cookies.get('token');
                if (!token) {
                    set({ isAuthenticated: false, user: null });
                    return;
                }

                set({ isLoading: true });
                try {
                    const response = await authApi.getMe();
                    set({
                        user: response.data.data,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch {
                    Cookies.remove('token');
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            },

            updateUser: (userData: Partial<User>) => {
                const currentUser = get().user;
                if (currentUser) {
                    set({ user: { ...currentUser, ...userData } });
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                token: state.token,
                // Don't persist user data - fetch it fresh
            }),
        }
    )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'BUYER' | 'SELLER' | 'ADMIN';
    subscriptionTier?: string;
}

interface AppState {
    user: User | null;
    token: string | null;
    login: (user: User, token: string) => void;
    logout: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            login: (user, token) => {
                localStorage.setItem('token', token);
                set({ user, token });
            },
            logout: () => {
                localStorage.removeItem('token');
                set({ user: null, token: null });
            },
        }),
        {
            name: 'auth-storage', // name of the item in the storage (must be unique)
        }
    )
);

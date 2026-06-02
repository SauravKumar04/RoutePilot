import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { queryClient } from '../main';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setCredentials: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      logout: () => {
        if (queryClient) {
          queryClient.clear();
        }

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData) =>
        set((state) => ({
          user: { ...state.user, ...userData },
        })),
    }),
    {
      name: 'routepilot-auth',
    }
  )
);
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 🚨 IMPORT the single source of truth from main.jsx
import { queryClient } from '../main'; 

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setCredentials: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true 
      }),
      
      logout: () => {
        // Wipes the central cache to prevent cross-user data leaks
        if (queryClient) {
          queryClient.clear();
        }

        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },
      
      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData }
      })),
    }),
    {
      name: 'routepilot-auth', // Key for localStorage
    }
  )
);
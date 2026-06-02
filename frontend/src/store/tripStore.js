import { create } from 'zustand';

export const useTripStore = create((set) => ({
  activeTrip: null,
  isOptimizing: false,
  
  setActiveTrip: (trip) => set({ activeTrip: trip }),
  clearActiveTrip: () => set({ activeTrip: null }),
  setOptimizing: (status) => set({ isOptimizing: status }),
}));
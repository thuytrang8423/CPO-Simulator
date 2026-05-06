import { create } from 'zustand';

export const useAppStore = create((set) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // StationManager selections
  selectedAccount: null,
  setSelectedAccount: (accountId) => set({ 
    selectedAccount: accountId,
    selectedStation: null,
    selectedCharger: null
  }),

  selectedStation: null,
  setSelectedStation: (stationId) => set({ 
    selectedStation: stationId,
    selectedCharger: null
  }),

  selectedCharger: null,
  setSelectedCharger: (chargerId) => set({ 
    selectedCharger: chargerId 
  }),
}));

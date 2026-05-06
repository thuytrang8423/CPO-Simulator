import { useQuery } from '@tanstack/react-query';
import { simulationApi, chargingSessionApi } from '../api';

export const useActiveSessions = () => {
  return useQuery({
    queryKey: ['activeSessions'],
    queryFn: async () => {
      const res = await simulationApi.getActiveSessions();
      return Array.isArray(res.data) ? res.data : [];
    },
    refetchInterval: 5000, // Poll every 5s just in case, but mutations will invalidate this immediately
  });
};

export const useDemoConnectors = () => {
  return useQuery({
    queryKey: ['demoConnectors'],
    queryFn: async () => {
      const res = await simulationApi.getDemoConnectors();
      return Array.isArray(res.data) ? res.data : [];
    },
  });
};

export const useAccounts = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const res = await chargingSessionApi.getAccounts();
      return Array.isArray(res.data) ? res.data : [];
    },
  });
};

export const useStations = (accountId) => {
  return useQuery({
    queryKey: ['stations', accountId],
    queryFn: async () => {
      const res = await chargingSessionApi.getStations(accountId);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!accountId,
  });
};

export const useChargers = (stationId) => {
  return useQuery({
    queryKey: ['chargers', stationId],
    queryFn: async () => {
      const res = await chargingSessionApi.getChargers(stationId);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!stationId,
  });
};

export const useConnectors = (chargerId) => {
  return useQuery({
    queryKey: ['connectors', chargerId],
    queryFn: async () => {
      const res = await chargingSessionApi.getConnectors(chargerId);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!chargerId,
    refetchInterval: 5000, // keep connectors fresh while viewing
  });
};

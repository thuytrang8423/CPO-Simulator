import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chargingSessionApi } from '../api';
import { toast } from 'sonner';

export const useStopSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId) => {
      await chargingSessionApi.stopSession({ sessionId });
    },
    onMutate: async (sessionId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['activeSessions'] });
      
      // Snapshot the previous value
      const previousSessions = queryClient.getQueryData(['activeSessions']);
      
      // Optimistically remove the session from the list
      queryClient.setQueryData(['activeSessions'], (old) => {
        return old ? old.filter(id => id !== sessionId) : [];
      });
      
      return { previousSessions };
    },
    onSuccess: (_, sessionId) => {
      toast.success(`Session ${sessionId} stopped successfully.`);
    },
    onError: (error, sessionId, context) => {
      console.error('Error stopping session:', error);
      toast.error('Failed to stop session.');
      // Rollback on error
      if (context?.previousSessions) {
        queryClient.setQueryData(['activeSessions'], context.previousSessions);
      }
    },
    onSettled: () => {
      // Add a slight delay before invalidating to allow backend state to settle
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
      }, 1000);
    }
  });
};

export const useStartRandomSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (count) => {
      await chargingSessionApi.startRandomSessions(count);
    },
    onSuccess: (_, count) => {
      toast.success(`Triggered ${count} random sessions! Check the Dashboard.`);
      // Refresh active sessions to see the new ones
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
      // Might want to refresh connectors if we are viewing them
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to start demo sessions. Make sure the API is running.');
    },
  });
};

export const useChangeConnectorStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      await chargingSessionApi.changeConnectorStatus(payload);
      return payload.evseId; // Pass charger ID to onSuccess for targeted invalidation
    },
    onSuccess: (evseId) => {
      toast.success('Status updated successfully!');
      // Invalidate the specific charger's connectors so the list updates instantly
      queryClient.invalidateQueries({ queryKey: ['connectors'] }); // Broad invalidation to be safe
    },
    onError: (error) => {
      console.error('Error updating status:', error);
      toast.error('Failed to update status.');
    },
  });
};

export const useStartSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      await chargingSessionApi.startSession(payload);
    },
    onSuccess: () => {
      toast.success('Charging session started!');
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
    },
    onError: (error) => {
      console.error('Error starting session:', error);
      toast.error('Failed to start session.');
    },
  });
};


import React, { useState } from 'react';
import { Activity, Zap, Battery, RefreshCw, PowerOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useActiveSessions } from '../hooks/useQueries';
import { useStopSession } from '../hooks/useMutations';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

const Dashboard = () => {
  const { data: activeSessions = [], isLoading: loading } = useActiveSessions();
  const stopSessionMutation = useStopSession();
  
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [sessionToStop, setSessionToStop] = useState(null);

  const confirmStop = (sessionId) => {
    setSessionToStop(sessionId);
    setIsAlertOpen(true);
  };

  const handleStopSession = async () => {
    if (!sessionToStop) return;
    const sessionId = sessionToStop;
    
    stopSessionMutation.mutate(sessionId, {
      onSettled: () => {
        setSessionToStop(null);
      }
    });
  };

  const stats = [
    { label: 'Active Sessions', value: activeSessions.length, icon: Activity, color: 'var(--accent)' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="view-header">
        <div className="view-title">
          <h1>Live Operations</h1>
          <p>Real-time monitoring of all active charging sessions.</p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-label">
              <stat.icon size={16} color={stat.color} />
              {stat.label}
            </div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="card-container">
        <div className="section-title">
          <Activity size={20} />
          Active Charging Sessions
        </div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <RefreshCw className="animate-spin" /> Loading sessions...
          </div>
        ) : activeSessions.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No active sessions currently running.
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted">
                <tr>
                  <th className="font-medium p-4 border-b">Session ID</th>
                  <th className="font-medium p-4 border-b">Status</th>
                  <th className="font-medium p-4 border-b text-right">Action</th>
                </tr>
              </thead>
              <tbody>
              {activeSessions.map((sessionId, index) => (
                <tr key={sessionId || index}>
                  <td className="p-4 border-b" style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>
                    {sessionId}
                  </td>
                  <td className="p-4 border-b"><span className="badge badge-charging">Active</span></td>
                  <td className="p-4 border-b text-right">
                    <button 
                      className="btn btn-outline hover:bg-destructive hover:text-destructive-foreground hover:border-destructive text-destructive border-destructive" 
                      style={{ padding: '6px 10px' }}
                      onClick={() => confirmStop(sessionId)}
                      disabled={stopSessionMutation.isPending && stopSessionMutation.variables === sessionId}
                      title="Stop Session"
                    >
                      {(stopSessionMutation.isPending && stopSessionMutation.variables === sessionId) ? <RefreshCw size={14} className="animate-spin" /> : <PowerOff size={14} />}
                      <span className="ml-2 text-xs">Stop</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop Charging Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to stop session <strong>{sessionToStop}</strong>? This action will disconnect the EV and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSessionToStop(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleStopSession} 
              disabled={stopSessionMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {stopSessionMutation.isPending ? <RefreshCw className="animate-spin h-4 w-4 mr-2" /> : null}
              Stop Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </motion.div>
  );
};

export default Dashboard;

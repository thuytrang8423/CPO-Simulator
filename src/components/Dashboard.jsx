import React, { useState } from 'react';
import { Activity, RefreshCw, PowerOff, Battery, Zap, Info } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

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
    stopSessionMutation.mutate(sessionToStop, {
      onSettled: () => {
        setIsAlertOpen(false);
        setSessionToStop(null);
      }
    });
  };

  return (
    <div className="p-6 space-y-8 h-full overflow-y-auto custom-scrollbar">
      <div className="view-header">
        <div className="view-title">
          <h1 className="text-4xl font-extrabold tracking-tight">Live Operations</h1>
          <p className="text-muted-foreground mt-2 text-lg">Real-time monitoring of all active charging sessions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest text-primary">
              <Activity size={14} /> Total Throughput
            </CardDescription>
            <CardTitle className="text-4xl font-black">{activeSessions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs opacity-60">Sessions currently drawing power.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="flex items-center gap-2">
            <Activity className="text-primary" size={20} />
            Active Charging Sessions
          </CardTitle>
          <CardDescription>Live session tracking and emergency control.</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <RefreshCw className="animate-spin mb-4" size={32} />
              <p>Syncing...</p>
            </div>
          ) : activeSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground opacity-50">
              <Battery size={48} className="mb-4" />
              <p>No active sessions found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold py-4 pl-6">Session ID</TableHead>
                  <TableHead className="font-bold py-4 text-center">Status</TableHead>
                  {/* <TableHead className="font-bold py-4 pr-6 text-right">Action</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSessions.map((sessionId, index) => (
                  <TableRow key={sessionId || index}>
                    <TableCell className="font-mono font-bold text-primary py-4 pl-6">
                      {sessionId}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 font-bold px-4 py-1">
                        CHARGING
                      </Badge>
                    </TableCell>
                    {/* <TableCell className="text-right pr-6">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-rose-500 border-rose-500/20 hover:bg-rose-500 hover:text-white font-bold gap-2"
                        onClick={() => confirmStop(sessionId)}
                        disabled={stopSessionMutation.isPending && stopSessionMutation.variables === sessionId}
                      >
                        {stopSessionMutation.isPending && stopSessionMutation.variables === sessionId ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <PowerOff size={14} />
                        )}
                        Stop
                      </Button>
                    </TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Stop Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to stop session <strong>{sessionToStop}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStopSession}
              disabled={stopSessionMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Stop Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;

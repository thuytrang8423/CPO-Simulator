import React, { useState } from 'react';
import { ChevronRight, Zap, MapPin, User, Activity, RefreshCw, PowerOff } from 'lucide-react';
import { useAppStore } from '../store/store';
import { 
  useAccounts, 
  useStations, 
  useChargers, 
  useConnectors 
} from '../hooks/useQueries';
import { useChangeConnectorStatus } from '../hooks/useMutations';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

const StationManager = () => {
  const { 
    selectedAccount, setSelectedAccount,
    selectedStation, setSelectedStation,
    selectedCharger, setSelectedCharger
  } = useAppStore();

  const { data: accounts = [], isLoading: loadingAccounts } = useAccounts();
  const { data: stations = [], isLoading: loadingStations } = useStations(selectedAccount);
  const { data: chargers = [], isLoading: loadingChargers } = useChargers(selectedStation);
  const { data: connectors = [], isLoading: loadingConnectors } = useConnectors(selectedCharger);

  const changeStatusMutation = useChangeConnectorStatus();

  const [isPlugInDialogOpen, setIsPlugInDialogOpen] = useState(false);
  const [targetConnector, setTargetConnector] = useState(null);
  
  const [sessionData, setSessionData] = useState({
    sessionId: '',
    currentTemp: '42.5',
    currentVoltage: '230.0',
    currentFirmware: '2.1'
  });

  const generateSessionId = () => `SES_MANUAL_${Math.floor(Math.random() * 1000000)}`;

  const handleOpenPlugIn = (connector) => {
    setTargetConnector(connector);
    setSessionData(prev => ({ ...prev, sessionId: generateSessionId() }));
    setIsPlugInDialogOpen(true);
  };

  const executePlugIn = () => {
    if (!targetConnector) return;
    const activeStation = stations.find(s => s.id === selectedStation);
    const activeCharger = chargers.find(c => c.id === selectedCharger);

    changeStatusMutation.mutate({
      stationId: activeStation?.stationCode || selectedStation,
      evseId: activeCharger?.evchargerCode || selectedCharger,
      connectorId: targetConnector.connectorNo || targetConnector.connectorId || 1,
      status: 'OCCUPIED',
      sessionId: sessionData.sessionId,
      currentTemp: parseFloat(sessionData.currentTemp),
      currentVoltage: parseFloat(sessionData.currentVoltage),
      currentFirmware: parseFloat(sessionData.currentFirmware)
    });
    setIsPlugInDialogOpen(false);
  };

  const handleUnplug = (connector) => {
    const activeStation = stations.find(s => s.id === selectedStation);
    const activeCharger = chargers.find(c => c.id === selectedCharger);

    changeStatusMutation.mutate({
      stationId: activeStation?.stationCode || selectedStation,
      evseId: activeCharger?.evchargerCode || selectedCharger,
      connectorId: connector.connectorNo || connector.connectorId || 1,
      status: 'AVAILABLE',
      sessionId: sessionData.sessionId || generateSessionId()
    });
  };

  const getStatusColor = (status) => {
    const s = status?.toUpperCase();
    if (s === 'AVAILABLE') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (s === 'OCCUPIED') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  };

  const anyLoading = loadingAccounts || loadingStations || loadingChargers || loadingConnectors || changeStatusMutation.isPending;

  return (
    <div className="p-6 h-full flex flex-col space-y-6 overflow-hidden">
      <div className="flex justify-between items-end mb-4">
        <div className="view-title">
          <h1 className="text-4xl font-extrabold tracking-tight">Manual Control</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage your charging network hierarchy.</p>
        </div>
        {anyLoading && <RefreshCw className="animate-spin text-primary" size={24} />}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Column 1: Accounts */}
        <Card className="flex flex-col h-full overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4 px-2 font-bold text-lg">
            <User size={20} className="text-primary"/> Accounts
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {accounts.map((item, idx) => {
              const id = item.accountId || idx;
              const isActive = selectedAccount === id;
              return (
                <button key={id} className={`w-full text-left flex justify-between items-center p-4 rounded-xl transition-all border ${isActive ? 'bg-primary/10 border-primary/50 shadow-inner' : 'bg-background/50 hover:bg-muted/50 border-transparent'}`} onClick={() => setSelectedAccount(id)}>
                  <span className={`font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>{item.name || id}</span>
                  <ChevronRight size={18} className={isActive ? 'text-primary' : 'text-muted-foreground opacity-50'}/>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Column 2: Stations */}
        <Card className="flex flex-col h-full overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4 px-2 font-bold text-lg">
            <MapPin size={20} className="text-primary"/> Stations
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {stations.map((item, idx) => {
                const id = item.id || idx;
                const isActive = selectedStation === id;
                return (
                  <button key={id} className={`w-full text-left flex justify-between items-center p-4 rounded-xl transition-all border ${isActive ? 'bg-primary/10 border-primary/50 shadow-inner' : 'bg-background/50 hover:bg-muted/50 border-transparent'}`} onClick={() => setSelectedStation(id)}>
                    <span className={`font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>{item.name || item.stationCode || id}</span>
                    <ChevronRight size={18} className={isActive ? 'text-primary' : 'text-muted-foreground opacity-50'}/>
                  </button>
                );
            })}
          </div>
        </Card>

        {/* Column 3: Chargers */}
        <Card className="flex flex-col h-full overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4 px-2 font-bold text-lg">
            <Zap size={20} className="text-primary"/> Chargers
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {chargers.map((item, idx) => {
                const id = item.id || idx;
                const isActive = selectedCharger === id;
                return (
                  <button key={id} className={`w-full text-left flex justify-between items-center p-4 rounded-xl transition-all border ${isActive ? 'bg-primary/10 border-primary/50 shadow-inner' : 'bg-background/50 hover:bg-muted/50 border-transparent'}`} onClick={() => setSelectedCharger(id)}>
                    <span className={`font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>{item.evchargerCode || item.name || id}</span>
                    <ChevronRight size={18} className={isActive ? 'text-primary' : 'text-muted-foreground opacity-50'}/>
                  </button>
                );
            })}
          </div>
        </Card>

        {/* Column 4: Control Area */}
        <Card className="flex flex-col h-full overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4 px-2 font-bold text-lg">
            <Activity size={20} className="text-primary"/> Live Port Control
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {connectors.map((con, idx) => {
                const status = con.status?.toUpperCase() || 'UNKNOWN';
                return (
                  <div key={con.id || idx} className="p-5 rounded-xl border border-border/50 bg-background/50 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">Port #{con.connectorNo || con.connectorId || idx + 1}</span>
                        <Badge className={`${getStatusColor(status)} border-none font-bold px-3 py-1 rounded-lg text-[10px]`}>
                            {status}
                        </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                        {status === 'AVAILABLE' ? (
                            <Button className="w-full h-11 bg-amber-500 hover:bg-amber-600 font-bold rounded-lg shadow-lg shadow-amber-500/10" onClick={() => handleOpenPlugIn(con)}>
                                <Activity size={16} className="mr-2"/> Plug In
                            </Button>
                        ) : (
                            <Button variant="outline" className="w-full h-11 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white font-bold rounded-lg" onClick={() => handleUnplug(con)}>
                                <PowerOff size={16} className="mr-2"/> Unplug
                            </Button>
                        )}
                    </div>
                  </div>
                );
            })}
            {connectors.length === 0 && (
                <div className="h-full flex items-center justify-center text-muted-foreground opacity-40 italic text-sm p-8 text-center">
                    Select a charger to view port controls
                </div>
            )}
          </div>
        </Card>
      </div>

      {/* Dialogs */}
      <Dialog open={isPlugInDialogOpen} onOpenChange={setIsPlugInDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Plug In Connector</DialogTitle>
            <DialogDescription>Inform the system that a vehicle has occupied this port.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label>Session ID</Label>
                <Input value={sessionData.sessionId} onChange={(e) => setSessionData({...sessionData, sessionId: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Temp (°C)</Label>
                    <Input type="number" value={sessionData.currentTemp} onChange={(e) => setSessionData({...sessionData, currentTemp: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label>Voltage (V)</Label>
                    <Input type="number" value={sessionData.currentVoltage} onChange={(e) => setSessionData({...sessionData, currentVoltage: e.target.value})} />
                </div>
            </div>
          </div>
          <DialogFooter><Button className="w-full bg-amber-500 font-bold h-12" onClick={executePlugIn}>Confirm Occupation</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StationManager;

import React, { useState } from 'react';
import { ChevronRight, Zap, MapPin, User, Activity, RefreshCw } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

const StationManager = () => {
  // Zustand State
  const { 
    selectedAccount, setSelectedAccount,
    selectedStation, setSelectedStation,
    selectedCharger, setSelectedCharger
  } = useAppStore();

  // React Query Data
  const { data: accounts = [], isLoading: loadingAccounts } = useAccounts();
  const { data: stations = [], isLoading: loadingStations } = useStations(selectedAccount);
  const { data: chargers = [], isLoading: loadingChargers } = useChargers(selectedStation);
  const { data: connectors = [], isLoading: loadingConnectors } = useConnectors(selectedCharger);

  const changeStatusMutation = useChangeConnectorStatus();

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [targetConnector, setTargetConnector] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [formData, setFormData] = useState({
    sessionId: '',
    currentTemp: '42.5',
    currentVoltage: '230.0',
    currentFirmware: '2.1'
  });

  const handleOpenDialog = (connector, newStatus) => {
    if (!newStatus) return;
    setTargetConnector(connector);
    setTargetStatus(newStatus);
    setFormData({
      ...formData,
      sessionId: `SES_MANUAL_${Math.floor(Math.random() * 1000)}`
    });
    setIsDialogOpen(true);
  };

  const handleSubmitStatusChange = () => {
    if (!targetConnector) return;

    setIsDialogOpen(false);
    
    const activeStation = stations.find(s => s.id === selectedStation);
    const activeCharger = chargers.find(c => c.id === selectedCharger);
    
    changeStatusMutation.mutate({
      stationId: activeStation?.stationCode || selectedStation,
      evseId: activeCharger?.evchargerCode || selectedCharger,
      connectorId: targetConnector.connectorNo || targetConnector.connectorId || 1,
      status: targetStatus,
      sessionId: formData.sessionId,
      currentTemp: parseFloat(formData.currentTemp),
      currentVoltage: parseFloat(formData.currentVoltage),
      currentFirmware: parseFloat(formData.currentFirmware)
    });
  };

  const anyLoading = loadingAccounts || loadingStations || loadingChargers || loadingConnectors || changeStatusMutation.isPending;

  return (
    <div className="station-manager-container h-full flex flex-col">
      <div className="view-header">
        <div className="view-title">
          <h1 className="text-3xl font-bold text-foreground">Infrastructure Browser</h1>
          <p className="text-muted-foreground">Drill down into your network hierarchy to manage specific connectors.</p>
        </div>
        {anyLoading && <RefreshCw className="animate-spin text-primary" size={20} />}
      </div>
      
      <div className="grid grid-cols-4 gap-4 flex-1 min-h-0">
        {/* Column 1: Accounts */}
        <div className="card-container flex flex-col h-full overflow-hidden">
          <div className="section-title text-foreground"><User size={18}/> Accounts</div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2">
            {accounts.length > 0 ? accounts.map((item, idx) => {
              const id = item.accountId || idx;
              const name = item.name || id;
              const isActive = selectedAccount === id;
              return (
                <div 
                  key={id} 
                  className={`list-item group flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all border ${
                    isActive ? 'bg-primary/10 border-primary text-primary' : 'bg-background hover:bg-muted border-border text-foreground'
                  }`}
                  onClick={() => setSelectedAccount(id)}
                >
                  <span className="font-medium">{name}</span>
                  <ChevronRight size={16} className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}/>
                </div>
              );
            }) : <p className="text-center text-muted-foreground mt-8 text-sm">{loadingAccounts ? 'Loading...' : 'No accounts found'}</p>}
          </div>
        </div>

        {/* Column 2: Stations */}
        <div className="card-container flex flex-col h-full overflow-hidden">
          <div className="section-title text-foreground"><MapPin size={18}/> Stations</div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2">
          {selectedAccount ? (
            <>
              {stations.length > 0 ? stations.map((item, idx) => {
                const id = item.id || idx;
                const name = item.name || item.stationCode || id;
                const isActive = selectedStation === id;
                return (
                  <div 
                    key={id} 
                    className={`list-item group flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all border ${
                      isActive ? 'bg-primary/10 border-primary text-primary' : 'bg-background hover:bg-muted border-border text-foreground'
                    }`}
                    onClick={() => setSelectedStation(id)}
                  >
                    <span className="font-medium">{name}</span>
                    <ChevronRight size={16} className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}/>
                  </div>
                );
              }) : <p className="text-center text-muted-foreground mt-8 text-sm">{loadingStations ? 'Loading...' : 'No stations found'}</p>}
            </>
          ) : <p className="text-center text-muted-foreground mt-8 text-sm">Select an account</p>}
          </div>
        </div>

        {/* Column 3: Chargers */}
        <div className="card-container flex flex-col h-full overflow-hidden">
          <div className="section-title text-foreground"><Zap size={18}/> Chargers</div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2">
          {selectedStation ? (
            <>
              {chargers.length > 0 ? chargers.map((item, idx) => {
                const id = item.id || idx;
                const name = item.evchargerCode || item.name || id;
                const isActive = selectedCharger === id;
                return (
                  <div 
                    key={id} 
                    className={`list-item group flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all border ${
                      isActive ? 'bg-primary/10 border-primary text-primary' : 'bg-background hover:bg-muted border-border text-foreground'
                    }`}
                    onClick={() => setSelectedCharger(id)}
                  >
                    <span className="font-medium">{name}</span>
                    <ChevronRight size={16} className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}/>
                  </div>
                );
              }) : <p className="text-center text-muted-foreground mt-8 text-sm">{loadingChargers ? 'Loading...' : 'No chargers found'}</p>}
            </>
          ) : <p className="text-center text-muted-foreground mt-8 text-sm">Select a station</p>}
          </div>
        </div>

        {/* Column 4: Connectors */}
        <div className="card-container flex flex-col h-full overflow-hidden">
          <div className="section-title text-foreground"><Activity size={18}/> Connectors</div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {selectedCharger ? (
            <>
              {connectors.length > 0 ? connectors.map((con, idx) => (
                <div key={con.id || idx} className="p-4 bg-background border border-border rounded-xl shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <strong className="text-foreground">Port #{con.connectorNo || con.connectorId || idx + 1}</strong>
                    <span className={`badge badge-${(con.status || 'unknown').toLowerCase()}`}>{con.status || 'Unknown'}</span>
                  </div>
                  
                  <Select onValueChange={(val) => handleOpenDialog(con, val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Change Status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">AVAILABLE</SelectItem>
                      <SelectItem value="PREPARING">PREPARING</SelectItem>
                      <SelectItem value="CHARGING">CHARGING</SelectItem>
                      <SelectItem value="SUSPENDED_EVSE">SUSPENDED_EVSE</SelectItem>
                      <SelectItem value="SUSPENDED_EV">SUSPENDED_EV</SelectItem>
                      <SelectItem value="FINISHING">FINISHING</SelectItem>
                      <SelectItem value="RESERVED">RESERVED</SelectItem>
                      <SelectItem value="UNAVAILABLE">UNAVAILABLE</SelectItem>
                      <SelectItem value="FAULTED">FAULTED</SelectItem>
                      <SelectItem value="OCCUPIED">OCCUPIED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )) : <p className="text-center text-muted-foreground mt-8 text-sm">{loadingConnectors ? 'Loading...' : 'No connectors found'}</p>}
            </>
          ) : <p className="text-center text-muted-foreground mt-8 text-sm">Select a charger</p>}
          </div>
        </div>
      </div>

      {/* Dynamic Values Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Connector Status</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground mb-2">
              You are setting Port #{targetConnector?.connectorNo || targetConnector?.connectorId} to <strong>{targetStatus}</strong>.
            </p>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sessionId" className="text-right">Session ID</Label>
              <Input 
                id="sessionId" 
                value={formData.sessionId} 
                onChange={(e) => setFormData({...formData, sessionId: e.target.value})}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="temp" className="text-right">Temp (°C)</Label>
              <Input 
                id="temp" 
                type="number" step="0.1"
                value={formData.currentTemp} 
                onChange={(e) => setFormData({...formData, currentTemp: e.target.value})}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="voltage" className="text-right">Voltage (V)</Label>
              <Input 
                id="voltage" 
                type="number" step="0.1"
                value={formData.currentVoltage} 
                onChange={(e) => setFormData({...formData, currentVoltage: e.target.value})}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firmware" className="text-right">Firmware</Label>
              <Input 
                id="firmware" 
                type="number" step="0.1"
                value={formData.currentFirmware} 
                onChange={(e) => setFormData({...formData, currentFirmware: e.target.value})}
                className="col-span-3" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitStatusChange} disabled={changeStatusMutation.isPending}>
              {changeStatusMutation.isPending && <RefreshCw className="animate-spin mr-2 h-4 w-4" />}
              Send Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StationManager;

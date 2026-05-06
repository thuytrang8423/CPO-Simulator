import React, { useState, useEffect } from 'react';
import { Play, RefreshCw, Zap, Activity, PowerOff, CheckCircle2, ChevronRight, Info, Sliders, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoConnectors } from '../hooks/useQueries';
import { useStartRandomSessions, useChangeConnectorStatus, useStartSession, useStopSession } from '../hooks/useMutations';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';

const DemoControl = () => {
  const [randomCount, setRandomCount] = useState(5);
  const [selectedDemo, setSelectedDemo] = useState(null);
  
  const [manualTarget, setManualTarget] = useState({
    stationId: '',
    evseId: '',
    connectorId: ''
  });

  const [manualSessionId, setManualSessionId] = useState('');
  const [manualStep, setManualStep] = useState(0); 
  
  const [telemetry, setTelemetry] = useState({
    temp: '42.0',
    voltage: '230.5',
    firmware: '2.1',
    soc: '15',
    targetSoc: '80',
    capacity: '75'
  });

  const { data: demoConnectors = [], isLoading: loadingConnectors, refetch: refetchConnectors } = useDemoConnectors();
  const startRandomMutation = useStartRandomSessions();
  const changeStatusMutation = useChangeConnectorStatus();
  const startSessionMutation = useStartSession();
  const stopSessionMutation = useStopSession();

  const handleStartRandom = () => {
    startRandomMutation.mutate(randomCount);
  };

  const selectForManual = (connector) => {
    setSelectedDemo(connector);
    setManualTarget({
      stationId: connector.stationId,
      evseId: connector.evseId,
      connectorId: connector.connectorId.toString()
    });
    setManualSessionId(`DEMO_MANUAL_${Math.floor(Math.random() * 10000)}`);
    setManualStep(0);
  };

  const executePlugIn = () => {
    changeStatusMutation.mutate({
      stationId: manualTarget.stationId,
      evseId: manualTarget.evseId,
      connectorId: parseInt(manualTarget.connectorId),
      status: 'OCCUPIED',
      sessionId: manualSessionId,
      currentTemp: parseFloat(telemetry.temp),
      currentVoltage: parseFloat(telemetry.voltage),
      currentFirmware: parseFloat(telemetry.firmware)
    }, {
        onSuccess: () => setManualStep(1)
    });
  };

  const executeStart = () => {
    startSessionMutation.mutate({
      sessionId: manualSessionId,
      stationId: manualTarget.stationId,
      evseId: manualTarget.evseId,
      connectorId: parseInt(manualTarget.connectorId),
      soc: parseInt(telemetry.soc),
      kwh: 0,
      targetSoc: parseInt(telemetry.targetSoc),
      batteryCapacityKwh: parseFloat(telemetry.capacity),
      currentTemp: parseFloat(telemetry.temp),
      currentVoltage: parseFloat(telemetry.voltage),
      currentFirmware: parseFloat(telemetry.firmware)
    }, {
        onSuccess: () => setManualStep(2)
    });
  };

  const executeStop = () => {
    stopSessionMutation.mutate(manualSessionId, {
        onSuccess: () => setManualStep(3)
    });
  };

  const executeUnplug = () => {
    changeStatusMutation.mutate({
      stationId: manualTarget.stationId,
      evseId: manualTarget.evseId,
      connectorId: parseInt(manualTarget.connectorId),
      status: 'AVAILABLE',
      sessionId: manualSessionId
    }, {
        onSuccess: () => {
            setManualStep(0);
            setSelectedDemo(null);
        }
    });
  };

  const getStepProgress = () => {
      if (manualStep === 0) return 0;
      if (manualStep === 1) return 33;
      if (manualStep === 2) return 66;
      return 100;
  };

  return (
    <div className="p-6 h-full flex flex-col space-y-6 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-end mb-4">
        <div className="view-title">
          <h1 className="text-4xl font-extrabold tracking-tight">Simulation Control</h1>
          <p className="text-muted-foreground mt-2 text-lg">Test your system with guided flows and live connectors.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg rounded-2xl">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2"><Sliders size={18} className="text-primary"/> Auto Generator</CardTitle>
                    <CardDescription>Launch random traffic sessions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Number of Sessions</Label>
                        <Input type="number" value={randomCount} onChange={(e) => setRandomCount(parseInt(e.target.value))} />
                    </div>
                    <Button onClick={handleStartRandom} disabled={startRandomMutation.isPending} className="w-full bg-primary font-bold gap-2">
                        {startRandomMutation.isPending ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />}
                        Launch Simulation
                    </Button>
                </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg rounded-2xl max-h-[600px] flex flex-col">
                <CardHeader className="pb-4 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2"><List size={18} className="text-primary"/> Demo Connectors</CardTitle>
                        <CardDescription>Select a live target from API.</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => refetchConnectors()} disabled={loadingConnectors}>
                        <RefreshCw className={loadingConnectors ? "animate-spin" : ""} size={16} />
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto custom-scrollbar space-y-2 p-4">
                    {loadingConnectors ? (
                        <div className="text-center p-8 text-muted-foreground italic">Fetching connectors...</div>
                    ) : demoConnectors.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground italic">No connectors found in API</div>
                    ) : (
                        demoConnectors.map((c, i) => (
                            <button 
                                key={i} 
                                onClick={() => selectForManual(c)} 
                                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedDemo?.evseId === c.evseId && selectedDemo?.connectorId === c.connectorId ? 'bg-primary/10 border-primary shadow-sm' : 'bg-background hover:bg-muted border-transparent'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-sm">{c.stationId}</div>
                                        <div className="text-[10px] opacity-60 font-mono">{c.evseId}</div>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-bold border-primary/20 text-primary">Port {c.connectorId}</Badge>
                                </div>
                            </button>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>

        <div className="xl:col-span-2">
            <AnimatePresence mode="wait">
                {selectedDemo ? (
                    <motion.div key="wizard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl rounded-2xl overflow-hidden">
                            <CardHeader className="bg-primary/5 border-b">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-2xl font-black text-primary">Manual Flow Wizard</CardTitle>
                                    <Button variant="ghost" onClick={() => setSelectedDemo(null)} className="font-bold">Cancel</Button>
                                </div>
                                <div className="mt-6">
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${getStepProgress()}%` }} />
                                    </div>
                                    <div className="flex justify-between mt-2 text-[10px] font-bold uppercase opacity-40">
                                        <span className={manualStep >= 0 ? 'text-primary' : ''}>Ready</span>
                                        <span className={manualStep >= 1 ? 'text-primary' : ''}>Plugged</span>
                                        <span className={manualStep >= 2 ? 'text-primary' : ''}>Charging</span>
                                        <span className={manualStep >= 3 ? 'text-primary' : ''}>Finished</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 grid grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-primary border-b pb-2 flex items-center gap-2"><Info size={16}/> Target Details (Editable)</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>Station ID</Label><Input value={manualTarget.stationId} onChange={(e) => setManualTarget({...manualTarget, stationId: e.target.value})} disabled={manualStep > 0} className="font-mono" /></div>
                                            <div className="space-y-2"><Label>Port</Label><Input value={manualTarget.connectorId} onChange={(e) => setManualTarget({...manualTarget, connectorId: e.target.value})} disabled={manualStep > 0} className="font-mono" /></div>
                                            <div className="col-span-2 space-y-2"><Label>EVSE ID</Label><Input value={manualTarget.evseId} onChange={(e) => setManualTarget({...manualTarget, evseId: e.target.value})} disabled={manualStep > 0} className="font-mono" /></div>
                                            <div className="col-span-2 space-y-2"><Label className="text-primary font-bold">Session ID</Label><Input value={manualSessionId} onChange={(e) => setManualSessionId(e.target.value)} disabled={manualStep > 0} className="font-mono border-primary/20" /></div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-primary border-b pb-2 flex items-center gap-2"><Sliders size={16}/> Telemetry Override</h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="space-y-2"><Label className="text-[10px] uppercase">Temp (°C)</Label><Input type="number" value={telemetry.temp} onChange={(e) => setTelemetry({...telemetry, temp: e.target.value})} /></div>
                                            <div className="space-y-2"><Label className="text-[10px] uppercase">Volt (V)</Label><Input type="number" value={telemetry.voltage} onChange={(e) => setTelemetry({...telemetry, voltage: e.target.value})} /></div>
                                            <div className="space-y-2"><Label className="text-[10px] uppercase">F/W Ver</Label><Input value={telemetry.firmware} onChange={(e) => setTelemetry({...telemetry, firmware: e.target.value})} /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center space-y-4 bg-muted/10 p-8 rounded-2xl border border-border/50">
                                    <h4 className="text-center text-[10px] font-bold uppercase opacity-40 mb-2">Action Sequence</h4>
                                    <Button onClick={executePlugIn} disabled={manualStep !== 0 || changeStatusMutation.isPending} className={`h-16 text-lg font-black transition-all ${manualStep === 0 ? 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20' : 'bg-muted text-muted-foreground'}`}>
                                        {changeStatusMutation.isPending && manualStep === 0 ? <RefreshCw className="animate-spin mr-2" /> : <Activity className="mr-2" />}
                                        1. Plug In
                                    </Button>
                                    <Button onClick={executeStart} disabled={manualStep !== 1 || startSessionMutation.isPending} className={`h-16 text-lg font-black transition-all ${manualStep === 1 ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20' : 'bg-muted text-muted-foreground'}`}>
                                        {startSessionMutation.isPending ? <RefreshCw className="animate-spin mr-2" /> : <Play className="mr-2" fill="currentColor" />}
                                        2. Start Charging
                                    </Button>
                                    <Button onClick={executeStop} disabled={manualStep !== 2 || stopSessionMutation.isPending} className={`h-16 text-lg font-black transition-all ${manualStep === 2 ? 'bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20' : 'bg-muted text-muted-foreground'}`}>
                                        {stopSessionMutation.isPending ? <RefreshCw className="animate-spin mr-2" /> : <PowerOff className="mr-2" />}
                                        3. Stop Session
                                    </Button>
                                    <Button onClick={executeUnplug} disabled={manualStep !== 3 || changeStatusMutation.isPending} className={`h-16 text-lg font-black transition-all ${manualStep === 3 ? 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20' : 'bg-muted text-muted-foreground'}`}>
                                        <CheckCircle2 className="mr-2" />
                                        4. Unplug
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center border-4 border-dashed rounded-[2rem] opacity-30 p-20 text-center">
                        <Zap size={64} className="mb-4" />
                        <p className="text-xl font-black uppercase tracking-widest">Select Target Connector</p>
                        <p className="text-sm mt-2">Pick a connector from the list to start the manual simulation pipeline.</p>
                    </div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DemoControl;

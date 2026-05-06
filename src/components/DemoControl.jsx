import React, { useState } from 'react';
import { Play, RefreshCw, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDemoConnectors } from '../hooks/useQueries';
import { useStartRandomSessions } from '../hooks/useMutations';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

const DemoControl = () => {
  const [count, setCount] = useState(5);
  
  const { data: demoConnectors = [], isLoading: loadingConnectors } = useDemoConnectors();
  const startSessionsMutation = useStartRandomSessions();

  const handleStartDemo = () => {
    startSessionsMutation.mutate(count);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="station-manager-container"
    >
      <div className="view-header">
        <div className="view-title">
          <h1>Simulation Control</h1>
          <p>Generate synthetic traffic to test your infrastructure.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card-container">
          <div className="section-title">
            <Play size={20} />
            Random Session Generator
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p className="text-muted-foreground text-sm">
              This will select random available connectors from the demo list and start charging sessions for them automatically.
            </p>
            <div className="grid gap-2">
              <Label htmlFor="sessionCount">Number of Sessions</Label>
              <Input 
                id="sessionCount"
                type="number" 
                value={count} 
                onChange={(e) => setCount(parseInt(e.target.value))}
                min="1"
                max="50"
              />
            </div>
            <Button 
              onClick={handleStartDemo}
              disabled={startSessionsMutation.isPending}
              className="w-full flex items-center justify-center gap-2"
            >
              {startSessionsMutation.isPending ? <RefreshCw className="animate-spin h-4 w-4" /> : <Play className="h-4 w-4" />}
              Start Simulation
            </Button>
          </div>
        </div>

        <div className="card-container">
          <div className="section-title" style={{ justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Zap size={20} /> Target Demo Connectors
            </span>
            {loadingConnectors && <RefreshCw className="animate-spin" size={16} />}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            These are the predefined connectors the simulator will use.
          </p>
          <div className="max-h-[300px] overflow-y-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted">
                <tr>
                  <th className="font-medium p-3 border-b">Station ID</th>
                  <th className="font-medium p-3 border-b">EVSE ID</th>
                  <th className="font-medium p-3 border-b text-right">Port</th>
                </tr>
              </thead>
              <tbody>
                {demoConnectors.map((c, i) => (
                  <tr key={i} className="hover:bg-muted/50">
                    <td className="p-3 border-b">{c.stationId}</td>
                    <td className="p-3 border-b">{c.evseId}</td>
                    <td className="p-3 border-b text-right"><span className="badge badge-available">#{c.connectorId}</span></td>
                  </tr>
                ))}
                {demoConnectors.length === 0 && !loadingConnectors && (
                  <tr>
                    <td colSpan="3" className="p-4 text-center text-muted-foreground">No demo connectors found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DemoControl;

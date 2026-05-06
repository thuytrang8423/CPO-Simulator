import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Extracted Components
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StationManager from './components/StationManager';
import DemoControl from './components/DemoControl';
import { Toaster } from './components/ui/sonner';

import { useAppStore } from './store/store';
import './index.css';

const queryClient = new QueryClient();

export default function App() {
  const activeTab = useAppStore((state) => state.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="main-content">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <Dashboard key="dashboard" />}
            {activeTab === 'stations' && <StationManager key="stations" />}
            {activeTab === 'demo' && <DemoControl key="demo" />}
          </AnimatePresence>
        </main>
        <Toaster position="top-right" richColors />
        
        <style dangerouslySetInnerHTML={{ __html: `
          .app-container {
            display: flex;
            height: 100vh;
            width: 100vw;
            overflow: hidden;
          }
        `}} />
      </div>
    </QueryClientProvider>
  );
}

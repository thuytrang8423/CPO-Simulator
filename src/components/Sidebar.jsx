import React from 'react';
import { LayoutDashboard, Zap, Play, LogOut } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useActiveSessions } from '../hooks/useQueries';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { data: activeSessions = [] } = useActiveSessions();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: activeSessions.length },
    { id: 'stations', icon: Zap, label: 'Manual Control' },
    { id: 'demo', icon: Play, label: 'Demo Center' },
  ];

  return (
    <div className="w-[260px] h-full bg-card border-r border-border flex flex-col p-6">
      <div className="flex items-center gap-3 mb-10 px-2">
        <Zap className="text-primary" size={28} fill="currentColor" />
        <h2 className="text-xl font-bold tracking-tight">CPO SIM</h2>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${isActive ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              onClick={() => setActiveTab(item.id)}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} />
                <span className="text-sm">{item.label}</span>
              </div>
              {item.badge > 0 && (
                <Badge variant="default" className="font-bold text-[10px] bg-primary text-white">
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;

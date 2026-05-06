import React from 'react';
import { LayoutDashboard, Zap, Settings, Play } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'stations', icon: Zap, label: 'Stations' },
    { id: 'demo', icon: Play, label: 'Demo Control' },
  ];

  return (
    <div className="sidebar">
      <div className="logo-container">
        <Zap className="logo-icon" />
        <span className="logo-text">CPO Simulator</span>
      </div>
      <nav>
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li 
              key={item.id} 
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={20} />
              {item.label}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;

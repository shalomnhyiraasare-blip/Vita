import React from "react";
import { Home, FileText, Camera, Bell, User, Upload, Settings } from "lucide-react";
import { TabType, UserProfile } from "../types";

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  activeAlertCount: number;
  user: UserProfile | null;
}

export default function BottomNav({ currentTab, onTabChange, activeAlertCount, user }: BottomNavProps) {
  const isOfficerPrivileged = user && (user.role === 'admin' || user.role === 'analyst' || user.role === 'govt_analyst' || user.role === 'intl_agency');
  const isBeneficiary = user && user.role === 'beneficiary';

  // Define tabs dynamically based on user privilege and roles
  let items = [];

  if (isBeneficiary) {
    items = [
      { id: 'reports' as TabType, label: 'My Reports', icon: FileText, badge: 0 },
      { id: 'profile' as TabType, label: 'Profile', icon: User, badge: 0 },
      { id: 'settings' as TabType, label: 'Settings', icon: Settings, badge: 0 }
    ];
  } else {
    items = [
      { id: 'home' as TabType, label: 'Dashboard', icon: Home, badge: 0 },
      { id: 'reports' as TabType, label: 'Reports', icon: FileText, badge: 0 },
      { id: 'field' as TabType, label: 'Submit Report', icon: Camera, badge: 0 },
      ...(isOfficerPrivileged ? [{ id: 'upload' as TabType, label: 'Upload Data', icon: Upload, badge: 0 }] : []),
      { id: 'alerts' as TabType, label: 'Alerts', icon: Bell, badge: activeAlertCount },
      { id: 'profile' as TabType, label: 'Profile', icon: User, badge: 0 },
      { id: 'settings' as TabType, label: 'Settings', icon: Settings, badge: 0 }
    ];
  }

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4 md:px-0 flex justify-center pointer-events-none select-none">
      <nav className="flex items-center space-x-1.5 md:space-x-3 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border border-gray-150 dark:border-gray-850 px-3 md:px-6 py-2.5 rounded-2xl md:rounded-3xl shadow-[0_12px_40px_-6px_rgba(0,0,0,0.14)] dark:shadow-[0_16px_50px_-8px_rgba(0,0,0,0.4)] pointer-events-auto transition-all duration-300 transform max-w-lg md:max-w-2xl w-full justify-between">
        
        {items.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1.5 md:py-1.5 md:px-3.5 rounded-xl text-center relative transition-all duration-200 group cursor-pointer ${
                isActive 
                  ? "bg-orange-50/70 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400 font-bold" 
                  : "text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {/* Icon layout with badge integration */}
              <div className="relative">
                <Icon className={`h-5 w-5 md:h-5.5 md:w-5.5 transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? "stroke-[2]" : "stroke-[1.6]"
                }`} />
                
                {tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-650 px-1 font-mono text-[9px] font-black text-white hover:scale-110">
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Responsive Text Label */}
              <span className={`text-[9.5px] md:text-[10px] tracking-wide mt-1.2 transition-all block ${
                isActive ? "font-bold text-orange-650 dark:text-orange-400" : "font-medium text-gray-400"
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}

      </nav>
    </div>
  );
}

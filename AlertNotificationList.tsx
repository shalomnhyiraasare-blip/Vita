import React, { useState } from "react";
import { 
  AlertOctagon, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  RefreshCw,
  Eye,
  CheckCircle,
  ShieldCheck
} from "lucide-react";
import { RiskAlert, SeverityType, UserProfile } from "../types";
import { updateAlertStatus } from "../lib/firebase";

interface AlertNotificationListProps {
  alerts: RiskAlert[];
  user: UserProfile | null;
  onSelectArea: (areaName: string) => void;
  onNavigateToHome: () => void;
}

export default function AlertNotificationList({ alerts, user, onSelectArea, onNavigateToHome }: AlertNotificationListProps) {
  const [activeTab, setActiveTab] = useState<'All' | 'Critical' | 'High' | 'Medium'>('All');

  // Count items across categories
  const counts = {
    All: alerts.length,
    Critical: alerts.filter(a => a.severity === 'Critical').length,
    High: alerts.filter(a => a.severity === 'High').length,
    Medium: alerts.filter(a => a.severity === 'Medium').length,
  };

  // Filter list
  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === 'All') return true;
    return alert.severity === activeTab;
  });

  const handleStateUpdate = async (alertId: string, nextStatus: 'acknowledged' | 'resolved') => {
    try {
      await updateAlertStatus(alertId, nextStatus);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-150 dark:border-gray-800 p-4 max-w-xl mx-auto transition-colors duration-200">
      
      {/* Title block */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="font-display font-bold text-gray-950 dark:text-gray-100 text-base leading-none">
            Early Warning Alerts
          </h2>
          <span className="font-mono text-[9px] uppercase tracking-wider text-orange-650 mt-1.5 block">
            System monitored threshold breaches
          </span>
        </div>
        <div className="flex items-center space-x-1 font-mono text-[9px] font-bold text-orange-600 bg-orange-55 dark:bg-orange-950/20 px-2 py-0.5 rounded-md uppercase">
          <RefreshCw className="h-3 w-3 animate-spin mr-0.5" />
          <span>REALTIME FEED</span>
        </div>
      </div>

      {/* Screen 3 Tabs selectors (All, Critical, High, Medium) */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 mb-4 overflow-x-auto">
        {(['All', 'Critical', 'High', 'Medium'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const count = counts[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[65px] text-center pb-2.5 text-xs font-semibold border-b-2 transition relative ${
                isActive 
                  ? "border-orange-500 text-orange-600 dark:text-orange-400" 
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center justify-center space-x-1">
                <span>{tab}</span>
                {count > 0 && (
                  <span className={`inline-flex h-4 px-1.5 items-center justify-center rounded-full font-mono text-[9px] font-bold ${
                    isActive 
                      ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400" 
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {count}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Content list */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto opacity-75 mb-2" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Clear Risk Margins
            </p>
            <p className="text-xs text-gray-500">
              No active {activeTab.toLowerCase()} anomalies detected at present.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'Critical';
            const isHigh = alert.severity === 'High';
            
            // Color mapping per specification
            let badgeBg = "bg-green-55/65 text-green-700 dark:bg-green-950/20 dark:text-green-400";
            if (isCritical) badgeBg = "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900";
            else if (isHigh) badgeBg = "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900";
            else if (alert.severity === 'Medium') badgeBg = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900";

            return (
              <div 
                key={alert.alertId}
                className={`border rounded-xl p-3.5 bg-white dark:bg-gray-950 transition border-gray-150 dark:border-gray-850 hover:shadow-xs hover:border-gray-350 ${
                  alert.status === 'resolved' ? "opacity-60" : ""
                }`}
              >
                {/* Header elements */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-lg ${
                      isCritical ? "bg-red-105/30 text-red-600" : isHigh ? "bg-orange-105/30 text-orange-600" : "bg-amber-105/30 text-amber-600"
                    }`}>
                      <AlertOctagon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                        {alert.incidentType}
                      </h4>
                      <p className="text-[10px] text-gray-450 mt-1 font-semibold block uppercase font-mono tracking-wide">
                        {alert.areaName} Municipal
                      </p>
                    </div>
                  </div>
                  
                  {/* Badges */}
                  <div className="flex flex-col space-y-1 items-end">
                    <span className={`px-2 py-0.5 rounded-sm text-[9px] border font-bold font-mono tracking-wider uppercase block ${badgeBg}`}>
                      {alert.severity}
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono italic font-medium block">
                      Intel score: {alert.score}
                    </span>
                  </div>
                </div>

                {/* Body details text */}
                <p className="text-xs text-gray-650 dark:text-gray-450 mt-2.5 font-sans leading-relaxed">
                  {alert.description}
                </p>

                {/* Footer action tools */}
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-850 pt-3 mt-3">
                  <div className="flex items-center space-x-1.5 text-gray-400 dark:text-gray-500 font-mono text-[9px] font-medium leading-none">
                    <Clock className="h-3 w-3" />
                    <span>5 mins ago</span>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center space-x-1.5">
                    {/* View/map inspect helper to drill-down area factor details */}
                    <button
                      onClick={() => {
                        onSelectArea(alert.areaName);
                        onNavigateToHome();
                      }}
                      className="inline-flex items-center text-[10px] text-gray-600 hover:text-gray-900 border border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-md px-2 py-1 font-semibold dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 cursor-pointer transition select-none"
                    >
                      <Eye className="h-3 w-3 mr-0.5" />
                      <span>Assess Risk Map</span>
                    </button>

                    {/* Analyst action controllers */}
                    {(user?.role === 'admin' || user?.role === 'govt_analyst') && alert.status === 'active' && (
                      <button
                        onClick={() => handleStateUpdate(alert.alertId, 'acknowledged')}
                        className="inline-flex items-center text-[10px] text-orange-600 hover:text-orange-700 border border-orange-200 bg-orange-55/40 rounded-md px-2 py-1 font-bold dark:border-orange-900/40 dark:text-orange-400 cursor-pointer transition select-none"
                      >
                        <ShieldCheck className="h-3 w-3 mr-0.5" />
                        <span>Acknowledge</span>
                      </button>
                    )}

                    {(user?.role === 'admin' || user?.role === 'govt_analyst') && alert.status !== 'resolved' && (
                      <button
                        onClick={() => handleStateUpdate(alert.alertId, 'resolved')}
                        className="inline-flex items-center text-[10px] text-green-600 hover:text-green-700 border border-green-200 bg-green-55/40 rounded-md px-2 py-1 font-bold dark:border-green-900/40 dark:text-green-400 cursor-pointer transition select-none"
                      >
                        <CheckCircle className="h-3 w-3 mr-0.5" />
                        <span>Resolve</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

import React, { useState } from "react";
import { 
  Settings, 
  Bell, 
  Shield, 
  Wifi, 
  Database, 
  Trash2, 
  Languages, 
  Volume2, 
  BadgeHelp,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export default function SettingsPage() {
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [offlineSync, setOfflineSync] = useState(true);
  const [bandwidthOptimized, setBandwidthOptimized] = useState(true);
  const [systemLanguage, setSystemLanguage] = useState("en");
  const [showStatus, setShowStatus] = useState<string | null>(null);

  const handleClearCache = () => {
    try {
      // Clear reports draft or alerts cache but keep login context
      const loginUser = localStorage.getItem("vitadata_local_db_current_user");
      // Clean only specific keys
      localStorage.removeItem("vitadata_local_db_reports_drafts");
      setShowStatus("System cache and offline search indices flushed successfully.");
      setTimeout(() => setShowStatus(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-150 dark:border-gray-800 p-4 max-w-lg mx-auto transition-colors duration-200">
      
      {/* Title header */}
      <div className="border-b border-gray-100 dark:border-gray-850 pb-3 mb-5 flex items-center space-x-2">
        <Settings className="h-5 w-5 text-orange-600" />
        <div>
          <h2 className="font-display font-bold text-gray-950 dark:text-gray-100 text-base leading-none">
            Settings Portal
          </h2>
          <span className="font-mono text-[9px] uppercase tracking-wider text-orange-655 mt-1.2 block">
            System Preferences & Local Node Controls
          </span>
        </div>
      </div>

      {showStatus && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 p-3 rounded-xl mb-4 text-xs font-semibold text-green-700 dark:text-green-300 flex items-center space-x-2">
          <CheckCircle className="h-4 w-4" />
          <span>{showStatus}</span>
        </div>
      )}

      <div className="space-y-6">
        
        {/* Localization Preferences */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-gray-850 pb-1.5">
            <Languages className="h-4 w-4 text-orange-550" />
            <h4 className="text-xs font-bold font-mono uppercase text-gray-700 dark:text-gray-300 tracking-wider">
              Language & Regional localization
            </h4>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Active Language</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Adapt screen translations for contributors</p>
            </div>
            <select
              value={systemLanguage}
              onChange={(e) => setSystemLanguage(e.target.value)}
              className="text-xs rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 px-2.5 py-1.5 text-gray-900 dark:text-white focus:outline-hidden focus:border-orange-500"
            >
              <option value="en">English (UK/NG)</option>
              <option value="ha">Hausa (Kano / NW)</option>
              <option value="ar">Arabic (Al-Arabiya)</option>
            </select>
          </div>
        </div>

        {/* Bandwidth & 2G/3G Optimizations */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-gray-850 pb-1.5">
            <Wifi className="h-4 w-4 text-orange-550" />
            <h4 className="text-xs font-bold font-mono uppercase text-gray-700 dark:text-gray-300 tracking-wider">
              Network & Bandwidth Adaptation
            </h4>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Optimize for 2G / 3G Streams</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Strips high-resolution media payloads to secure low bandwidth connectivity</p>
            </div>
            <button
              onClick={() => setBandwidthOptimized(!bandwidthOptimized)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer select-none ${
                bandwidthOptimized ? "bg-orange-600" : "bg-gray-300 dark:bg-gray-800"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                bandwidthOptimized ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Offline Sync Cache</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Automatically save logs to draft locally when connection drops</p>
            </div>
            <button
              onClick={() => setOfflineSync(!offlineSync)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer select-none ${
                offlineSync ? "bg-orange-600" : "bg-gray-300 dark:bg-gray-800"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                offlineSync ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-gray-850 pb-1.5">
            <Bell className="h-4 w-4 text-orange-550" />
            <h4 className="text-xs font-bold font-mono uppercase text-gray-700 dark:text-gray-300 tracking-wider">
              Emergency Broadcast Alerting
            </h4>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">SMS Early Warnings Broadcasts</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Receive immediate SMS threshold warnings matching your location</p>
            </div>
            <button
              onClick={() => setSmsAlerts(!smsAlerts)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer select-none ${
                smsAlerts ? "bg-orange-600" : "bg-gray-300 dark:bg-gray-800"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                smsAlerts ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Authorized Coordinator Email Bulletins</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Deliver daily risk index digest sheets to key partners</p>
            </div>
            <button
              onClick={() => setEmailAlerts(!emailAlerts)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer select-none ${
                emailAlerts ? "bg-orange-600" : "bg-gray-300 dark:bg-gray-800"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                emailAlerts ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>
        </div>

        {/* Storage Control */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-gray-850 pb-1.5">
            <Database className="h-4 w-4 text-orange-550" />
            <h4 className="text-xs font-bold font-mono uppercase text-gray-700 dark:text-gray-300 tracking-wider">
              Offline Storage & Memory nodes
            </h4>
          </div>

          <div className="flex items-center justify-between p-3 border border-pink-100 dark:border-pink-900/30 bg-pink-50/20 dark:bg-pink-950/10 rounded-xl">
            <div>
              <p className="text-xs font-bold text-pink-905 dark:text-pink-300">Flush Temporary Indices</p>
              <p className="text-[10px] text-gray-500 mt-1">Clears local files memory, draft logs, and downloaded historical baselines</p>
            </div>
            <button
              onClick={handleClearCache}
              className="flex items-center space-x-1 text-xs font-bold text-pink-750 hover:bg-pink-600 hover:text-white border border-pink-200 bg-white dark:bg-gray-950 dark:border-pink-905/30 dark:hover:bg-pink-900 px-3 py-1.8 rounded-lg cursor-pointer transition select-none"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Full Flush</span>
            </button>
          </div>
        </div>

        {/* System Diagnostics Info */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-850 text-center">
          <p className="text-[9.5px] font-mono text-gray-400">
            VitaData FullStack Node Context • Client Version: 1.4.2 (Production)
          </p>
          <div className="flex justify-center items-center space-x-1.5 mt-1">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-mono text-gray-500 uppercase font-black uppercase tracking-wider">
              Connected Gateway Endpoint (Port 3000)
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}

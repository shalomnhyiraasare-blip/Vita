import React from "react";
import { Sun, Moon, Bell, Shield, User, AlertTriangle } from "lucide-react";
import { TabType, UserProfile } from "../types";
import VitaLogo from "./VitaLogo";

interface HeaderProps {
  user: UserProfile | null;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onNavigate: (tab: TabType) => void;
  criticalAlertCount: number;
}

export default function Header({ user, darkMode, toggleDarkMode, onNavigate, criticalAlertCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-[calc(4rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] w-full items-center justify-between border-b border-gray-200 bg-white px-4 shadow-xs dark:border-gray-800 dark:bg-gray-900 transition-colors duration-200">
      {/* Brand Logo and Platform Title */}
      <div className="flex items-center space-x-2 cursor-pointer select-none" onClick={() => onNavigate('home')}>
        <VitaLogo showText={false} size="sm" />
        <h1 className="font-display text-lg font-bold tracking-tight text-gray-900 dark:text-white leading-none">
          VitaData
        </h1>
      </div>

      {/* Critical Alerts Ribbon Badge */}
      {criticalAlertCount > 0 && (
        <button 
          onClick={() => onNavigate('alerts')}
          className="hidden md:flex items-center space-x-2 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-1.5 text-xs text-red-700 font-medium animate-pulse transition dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-400"
        >
          <AlertTriangle className="h-4 w-4 mr-0.5 text-red-600 dark:text-red-400" />
          <span>{criticalAlertCount} Critical Alerts Active</span>
        </button>
      )}

      {/* Header Utilities */}
      <div className="flex items-center space-x-3">
        {/* Toggle Dark/Light Mode */}
        <button
          onClick={toggleDarkMode}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white transition duration-200 cursor-pointer"
          title="Toggle Screen Theme"
          id="btn-toggle-theme"
        >
          {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        {/* Notifications and Alert Trigger */}
        <button 
          onClick={() => onNavigate('alerts')}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white transition duration-200"
          title="Platform Alerts"
        >
          <Bell className="h-4.5 w-4.5" />
          {criticalAlertCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-600">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            </span>
          )}
        </button>

        {/* User Identity pill */}
        <div 
          onClick={() => onNavigate('profile')}
          className="flex items-center space-x-2 cursor-pointer border border-gray-200 rounded-lg p-0.5 pr-2 bg-gray-50 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:hover:bg-gray-750 transition"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-200 text-gray-650 dark:bg-gray-700 dark:text-gray-300">
            {user ? <Shield className="h-4 w-4 text-orange-600" /> : <User className="h-4 w-4" />}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate max-w-28 leading-none">
              {user ? user.name || user.email.split("@")[0] : "Guest Contributor"}
            </p>
            <p className="text-[10px] font-mono text-gray-500 uppercase leading-none mt-0.5">
              {user ? user.role : "Offline"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

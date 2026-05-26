import React, { useState } from "react";
import { 
  ShieldAlert, 
  UserCheck, 
  LogOut, 
  LogIn, 
  Key, 
  User, 
  Briefcase, 
  TrendingUp, 
  Info,
  CheckCircle2,
  Lock
} from "lucide-react";
import { UserProfile } from "../types";
import { authenticateUser, logoutUser, isRealFirebase } from "../lib/firebase";

interface UserProfileDetailsProps {
  user: UserProfile | null;
  onRefresh: () => void;
}

export default function UserProfileDetails({ user, onRefresh }: UserProfileDetailsProps) {
  const [selectedSimulatedRole, setSelectedSimulatedRole] = useState<'admin' | 'analyst' | 'contributor'>('admin');
  const [isSignLoading, setIsSignLoading] = useState(false);

  const handleSimulatedSignIn = async () => {
    setIsSignLoading(true);
    try {
      await authenticateUser(selectedSimulatedRole);
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSignLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsSignLoading(true);
    try {
      await logoutUser();
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSignLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-150 dark:border-gray-800 p-4 max-w-md mx-auto transition-colors duration-200">
      
      {/* Title */}
      <div className="border-b border-gray-100 dark:border-gray-850 pb-3 mb-4">
        <h2 className="font-display font-bold text-gray-950 dark:text-gray-100 text-base leading-none">
          Risk Gateway Portal
        </h2>
        <span className="font-mono text-[9px] uppercase tracking-wider text-orange-650 mt-1.5 block">
          Role-Based Access Control and Identity Gate
        </span>
      </div>

      {user ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-green-200 bg-green-55/20 dark:border-green-950/40 dark:bg-green-950/10 p-4">
            <div className="flex items-start space-x-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-green-500 text-white shadow-sm flex-shrink-0">
                <UserCheck className="h-5.5 w-5.5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                    Session Status: Authenticated
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  You are logged into the localized early warning pipeline framework.
                </p>
                
                {/* User Info grid */}
                <div className="mt-3.5 space-y-2 text-xs border-t border-gray-100 dark:border-gray-800 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">User Identifier:</span>
                    <span className="font-mono text-[11px] font-semibold text-gray-700 dark:text-gray-300">{user.uid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Email Address:</span>
                    <span className="font-mono text-[11px] font-semibold text-gray-700 dark:text-gray-300">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Assigned Role:</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md font-mono text-[9px] font-bold text-orange-650 bg-orange-55 border border-orange-200 uppercase">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action privileges details */}
          <div className="bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-850 p-3.5 rounded-xl space-y-2">
            <span className="text-[9px] font-mono font-semibold text-gray-400 uppercase tracking-wider block">Access Permissions</span>
            <div className="space-y-1 text-xs">
              <div className="flex items-center text-gray-650 dark:text-gray-450">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                <span>Submit early-warning community reports</span>
              </div>
              {user.role !== 'contributor' && (
                <div className="flex items-center text-gray-650 dark:text-gray-450">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                  <span>View all statewide metrics, factor breakdowns, trends</span>
                </div>
              )}
              {user.role === 'admin' && (
                <div className="flex items-center text-gray-650 dark:text-gray-450">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                  <span>Acknowledge and Resolve system critical threshold breaches</span>
                </div>
              )}
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleSignOut}
            disabled={isSignLoading}
            className="flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-lg active:scale-97 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            <span>Terminate Interactive Session</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-55/15 dark:border-amber-950/30 dark:bg-amber-950/5 p-4">
            <div className="flex items-start space-x-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm flex-shrink-0">
                <Lock className="h-5.5 w-5.5 animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-905 dark:text-white leading-none">
                  Vetting Required
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Authentication validates early warning security reports. If running in a preview/remixed sandbox, simulate user personas representing PRD constraints.
                </p>
              </div>
            </div>
          </div>

          {/* Simulation Controls or Google authenticators */}
          <div className="space-y-3.5 border-t border-gray-100 dark:border-gray-800 pt-3">
            <div>
              <label className="block text-xs font-semibold text-gray-650 dark:text-gray-450 uppercase font-mono mb-2">
                Simulated Persona / Level
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'admin' as const, label: 'Admin (Amara)', title: 'Analyst/Policy' },
                  { id: 'analyst' as const, label: 'NGO Lead', title: 'James (v1 Review)' },
                  { id: 'contributor' as const, label: 'CHW Fatima', title: 'Field submissions' }
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedSimulatedRole(role.id)}
                    className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-lg border text-center transition h-16 cursor-pointer ${
                      selectedSimulatedRole === role.id 
                        ? "border-orange-500 bg-orange-55/40 text-orange-650" 
                        : "border-gray-200 bg-white dark:border-gray-830 dark:bg-gray-950 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-850"
                    }`}
                  >
                    <span className="text-[10px] font-bold block">{role.label}</span>
                    <span className="text-[8px] text-gray-400 font-medium block mt-1 tracking-wide uppercase font-mono">{role.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Authenticate button (Touch Target min 44px) */}
            <button
              onClick={handleSimulatedSignIn}
              disabled={isSignLoading}
              className="flex items-center justify-center w-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-3.5 rounded-xl hover:shadow active:scale-95 transition cursor-pointer"
            >
              <LogIn className="h-4.5 w-4.5 mr-1.5" />
              <span>Initiate Interactive Session</span>
            </button>
          </div>

          {/* System status details */}
          {isRealFirebase && (
            <div className="flex items-center space-x-1 justify-center mt-3 text-[10px] text-gray-400 font-mono">
              <Info className="h-3 w-3" />
              <span>External Live Auth Integration Ready</span>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from "react";
import { 
  LogIn, 
  UserPlus, 
  Info, 
  Loader2, 
  ShieldCheck, 
  Cpu, 
  Smartphone, 
  Mail, 
  ArrowLeft, 
  HeartHandshake,
  Check,
  X,
  Compass
} from "lucide-react";
import { 
  authenticateUser, 
  isRealFirebase, 
  registerCustomUser, 
  loginCustomUser 
} from "../lib/firebase";
import VitaLogo from "./VitaLogo";
import { UserProfile } from "../types";

interface AuthGatewayProps {
  onAuthSuccess: () => void;
}

export default function AuthGateway({ onAuthSuccess }: AuthGatewayProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [usePhoneAuth, setUsePhoneAuth] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Input fields
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserProfile['role']>('admin');
  const [resetEmail, setResetEmail] = useState("");
  
  // Status handlers
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Real-time password strength validation rules
  const [passRules, setPassRules] = useState({
    length: false,
    upper: false,
    lower: false,
    digit: false,
    special: false
  });

  // Calculate password rules
  useEffect(() => {
    setPassRules({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      digit: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    });
  }, [password]);

  const isPasswordStrong = passRules.length && passRules.upper && passRules.lower && passRules.digit && passRules.special;

  // Sign up & Login submit logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Reset password sub-flow
    if (isForgotPassword) {
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMessage(`Reset credentials dispatched! A mock validation link has been sent to ${resetEmail || "your email node"}.`);
        setResetEmail("");
      }, 1500);
      return;
    }

    // Sign up specific checks
    if (!isLogin) {
      if (!name.trim()) {
        setErrorMessage("Full Name is mandatory to sign up.");
        setIsLoading(false);
        return;
      }
      if (!isPasswordStrong) {
        setErrorMessage("Please ensure your security password meets all strong requirements.");
        setIsLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        const idToCheck = usePhoneAuth ? phone : email;
        if (!idToCheck) {
          throw new Error(`Please fill in your ${usePhoneAuth ? "Phone Number" : "Email Address"}`);
        }
        await loginCustomUser(idToCheck);
      } else {
        await registerCustomUser(name, usePhoneAuth ? "" : email, usePhoneAuth ? phone : "", selectedRole);
      }
      onAuthSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Credential authentication failure.");
    } finally {
      setIsLoading(false);
    }
  };

  // Skip / quick simulation bypass actions (role assignments)
  const handleSimulateQuickLogin = async (role: UserProfile['role']) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      // Create a simulated record if none exists or logon directly.
      const nameMapping = {
        admin: "Admin Auditor",
        govt_analyst: "State Government Analyst",
        intl_agency: "UN International Specialist",
        analyst: "RedCross NGO Lead",
        contributor: "Aliyu Musa (Field CHW)",
        beneficiary: "Binta Bello (Community Beneficiary)"
      };
      
      try {
        await registerCustomUser(
          nameMapping[role], 
          `${role}@vitadata.org`, 
          `080312${Math.floor(Math.random() * 10000)}`, 
          role
        );
      } catch {
        // Already registered, fetch logon channel directly
        await loginCustomUser(`${role}@vitadata.org`);
      }
      onAuthSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Quick bypass sandbox failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Available client roles
  const rolesList: { id: UserProfile['role']; label: string }[] = [
    { id: 'admin', label: 'Admin' },
    { id: 'govt_analyst', label: 'Government Analyst' },
    { id: 'intl_agency', label: 'International Agency' },
    { id: 'analyst', label: 'NGO' },
    { id: 'contributor', label: 'Field CHW' },
    { id: 'beneficiary', label: 'Beneficiary' }
  ];

  return (
    <div className="absolute inset-0 bg-slate-50 flex flex-col justify-between text-gray-950 selection:bg-orange-600 selection:text-white p-6 overflow-y-auto min-h-screen">
      
      {/* Dynamic Bright Background Accents with Logo colors */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#22C55E]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#EA580C]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-[#1319c9]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Block */}
      <div className="relative text-center mt-6 z-10 flex flex-col items-center select-none">
        <VitaLogo showText={true} showSlogan={true} size="lg" />
      </div>

      {/* Forgot Password Mode */}
      {isForgotPassword ? (
        <div className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl z-20 w-full max-w-sm mx-auto my-6">
          <button 
            type="button"
            onClick={() => { setIsForgotPassword(false); setErrorMessage(""); setSuccessMessage(""); }}
            className="flex items-center space-x-1 text-xs text-orange-600 hover:text-orange-700 mb-4 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Account Access</span>
          </button>
          
          <h2 className="text-base font-bold text-gray-900 mb-1.5 flex items-center space-x-2">
            <span>Forgot Password</span>
          </h2>
          <p className="text-[10.5px] text-gray-500 mb-4 leading-relaxed">
            Enter your email to lookup your secure key parameters. We will model instructions to retrieve access.
          </p>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 mb-3 text-[10px] text-red-700 font-mono">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-3 text-[10.5px] text-emerald-700 font-sans">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[9.5px] font-bold text-gray-500 uppercase font-mono tracking-wide mb-1">
                Your Email Address
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="shalasare43@gmail.com"
                className="w-full text-xs rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#EA580C] focus:bg-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !resetEmail}
              className="flex items-center justify-center w-full bg-[#EA580C] hover:bg-orange-700 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md transition disabled:opacity-50 h-10.5 cursor-pointer"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Dispatched Recovery Ticket</span>}
            </button>
          </form>
        </div>
      ) : (
        /* Regular Login/Register UI Card */
        <div className="relative bg-white border-2 border-l-[#22C55E]/90 border-t-[#EA580C] border-r-[#1319c9] border-b-[#22C55E]/40 rounded-2xl p-6 shadow-2xl z-20 w-full max-w-sm mx-auto my-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-950 leading-none">
              {isLogin ? "Login" : "Create an account"}
            </h2>
            <p className="text-[10.5px] text-gray-500 mt-1.5 leading-relaxed">
              {isLogin 
                ? "Access localized indicators and community alerts." 
                : "Join the neighborhood-level extreme poverty reduction database."
              }
            </p>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 mb-3 text-[10px] text-red-700 font-mono">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-55 border border-emerald-200 rounded-lg p-3 mb-3 text-[10.5px] text-emerald-700 font-sans">
              {successMessage}
            </div>
          )}

          {/* Social login buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button 
              type="button" 
              onClick={() => { setSuccessMessage("Google sign-in flows would be routed directly in production builds."); setTimeout(() => setSuccessMessage(""), 3500); }}
              className="flex items-center justify-center space-x-1.5 py-2 rounded-lg border border-gray-250 bg-gray-50 hover:bg-gray-100 text-[10.5px] text-gray-700 font-semibold transition active:scale-95 cursor-pointer"
            >
              <span>Continue with Google</span>
            </button>
            <button 
              type="button" 
              onClick={() => { setSuccessMessage("Apple Secure ID validation active in production environment."); setTimeout(() => setSuccessMessage(""), 3500); }}
              className="flex items-center justify-center space-x-1.5 py-2 rounded-lg border border-gray-255 bg-gray-50 hover:bg-gray-100 text-[10.5px] text-gray-700 font-semibold transition active:scale-95 cursor-pointer"
            >
              <span>Continue with Apple</span>
            </button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-3 text-[9px] font-mono text-gray-400 uppercase tracking-widest">or use credentials</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Toggle Email vs Phone number entries */}
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={() => { setUsePhoneAuth(!usePhoneAuth); setErrorMessage(""); }}
              className="flex items-center space-x-1 text-[10px] text-orange-600 hover:text-orange-700 font-bold cursor-pointer"
            >
              {usePhoneAuth ? <Mail className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
              <span>{usePhoneAuth ? "Use Email Address" : "Use Phone Number"}</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Full Name input for registration */}
            {!isLogin && (
              <div>
                <label className="block text-[9.5px] font-bold text-gray-500 uppercase font-mono tracking-wide mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Amina Garba"
                  className="w-full text-xs rounded-lg border border-gray-250 bg-gray-55 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#EA580C] focus:bg-white"
                  required
                />
              </div>
            )}

            {/* Email entry field */}
            {!usePhoneAuth ? (
              <div>
                <label className="block text-[9.5px] font-bold text-gray-500 uppercase font-mono tracking-wide mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="shalasare43@gmail.com"
                  className="w-full text-xs rounded-lg border border-gray-250 bg-gray-55 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#EA580C] focus:bg-white"
                  required
                />
              </div>
            ) : (
              /* Phone number entry field */
              <div>
                <label className="block text-[9.5px] font-bold text-gray-500 uppercase font-mono tracking-wide mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 803 123 4567"
                  className="w-full text-xs rounded-lg border border-gray-250 bg-gray-55 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#EA580C] focus:bg-white"
                  required
                />
              </div>
            )}

            {/* Password input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[9.5px] font-bold text-gray-500 uppercase font-mono tracking-wide">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => { setIsForgotPassword(true); setErrorMessage(""); }}
                    className="text-[9.5px] font-bold text-orange-600 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs rounded-lg border border-gray-250 bg-gray-55 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#EA580C] focus:bg-white"
                required
              />
            </div>

            {/* Password strength UI indicators on SIGN UP mode */}
            {!isLogin && password && (
              <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg space-y-1.5">
                <p className="text-[9px] font-bold font-mono text-gray-500 uppercase tracking-widest border-b border-gray-205 pb-1">
                  Password Strength Checklist:
                </p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  {[
                    { flag: passRules.length, text: "Min 8 chars" },
                    { flag: passRules.upper, text: "Uppercase [A-Z]" },
                    { flag: passRules.lower, text: "Lowercase [a-z]" },
                    { flag: passRules.digit, text: "Digit [0-9]" },
                    { flag: passRules.special, text: "Special char" }
                  ].map((rule, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5 text-[9.5px]">
                      {rule.flag ? (
                        <Check className="h-3 w-3 text-green-600 stroke-[3]" />
                      ) : (
                        <X className="h-3 w-3 text-red-650 " />
                      )}
                      <span className={rule.flag ? "text-green-700 font-bold" : "text-gray-400"}>
                        {rule.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Account Privilege Role dropdown selectors */}
            {!isLogin && (
              <div className="border border-gray-200 bg-gray-55 p-2.5 rounded-lg">
                <label className="block text-[9.5px] font-bold text-orange-600 uppercase font-mono tracking-wider mb-2">
                  Select Account Privilege Role
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {rolesList.map((role) => {
                    const isSelected = selectedRole === role.id;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        className={`py-1.5 px-1 rounded-md text-[8.5px] font-bold font-mono tracking-wide uppercase border transition ${
                          isSelected 
                            ? "bg-orange-600 border-orange-500 text-white shadow-sm" 
                            : "bg-transparent border-gray-200 text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        {role.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || (!isLogin && !isPasswordStrong)}
              className="flex items-center justify-center w-full bg-[#EA580C] hover:bg-orange-700 text-white text-xs font-bold py-3.5 px-4 rounded-xl shadow-md transition disabled:opacity-40 select-none cursor-pointer h-11"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : isLogin ? (
                <>
                  <LogIn className="h-4 w-4 mr-1.5" />
                  <span>Login</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-1.5" />
                  <span>Sign Up</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle account creation / login footer link */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setErrorMessage(""); setSuccessMessage(""); }}
              className="text-[10px] font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer select-none"
            >
              {isLogin 
                ? "Don't have an account? Sign Up" 
                : "Already have an account? Log In"
              }
            </button>
          </div>
        </div>
      )}

      {/* Advanced Quick Sandbox Bypass Control Node - Crucial for fast developer testing audits */}
      <div className="relative mt-4 mb-2 z-10 text-center space-y-2">
        <div className="flex items-center space-x-1 justify-center text-[9px] font-mono text-gray-500 uppercase tracking-widest select-none">
          <Cpu className="h-3 w-3 text-orange-600 animate-pulse" />
          <span>Interactive Sandbox Bypass</span>
        </div>
        
        <div className="grid grid-cols-3 gap-1.5 max-w-sm mx-auto p-2 bg-white/90 border border-gray-200 rounded-xl shadow-xs">
          {[
            { id: 'admin' as const, label: 'Admin' },
            { id: 'govt_analyst' as const, label: 'Gov Analyst' },
            { id: 'intl_agency' as const, label: 'Intl Agency' },
            { id: 'analyst' as const, label: 'NGO' },
            { id: 'contributor' as const, label: 'Field CHW' },
            { id: 'beneficiary' as const, label: 'Beneficiary' }
          ].map((persona) => (
            <button
              key={persona.id}
              onClick={() => handleSimulateQuickLogin(persona.id)}
              disabled={isLoading}
              className="text-[8.5px] font-bold font-mono tracking-wide px-1.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-[#1319c9] hover:text-[#EA580C] transition cursor-pointer select-none"
            >
              {persona.label}
            </button>
          ))}
        </div>
        
        <p className="text-[8px] text-gray-500 leading-normal max-w-xs mx-auto select-none">
          The sandbox bypass allows rapid role testing (Admin, Gov Analyst, Intl Agency, NGO, Field CHW, Beneficiary) to verify authorization views on the fly.
        </p>
      </div>

    </div>
  );
}

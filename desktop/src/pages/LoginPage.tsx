import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useNotificationStore } from '../store/notificationStore';
import { Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onBackToLanding?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToLanding }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const loginAction = useAppStore((state) => state.login);
  const addToast = useNotificationStore((state) => state.addToast);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Validation Error', 'Please fill in all credentials.', 'warning');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      addToast('Validation Error', 'Please enter a valid email address.', 'warning');
      return;
    }
    setIsLoading(true);
    // Simulate auth token check/hash save
    setTimeout(() => {
      loginAction(email, 'session_' + Math.random().toString(36).substring(2, 12));
      addToast('Access Granted', `Welcome back, ${email.split('@')[0]}!`, 'success');
      setIsLoading(false);
    }, 1200);
  };

  const handleGuestMode = () => {
    setIsLoading(true);
    setTimeout(() => {
      loginAction('guest@appforge.local', 'guest_' + Math.random().toString(36).substring(2, 12));
      addToast('Guest Mode Activated', 'Running workspace in sandbox environment.', 'info');
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#07080d] bg-radial-gradient from-violet-950/20 via-slate-950 to-slate-950 p-6 relative overflow-hidden select-none">
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10">
        {onBackToLanding && (
          <button
            type="button"
            onClick={onBackToLanding}
            className="absolute left-6 top-6 text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer font-bold"
          >
            &larr; Back
          </button>
        )}
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-white text-2xl shadow-xl shadow-violet-500/20">
            AF
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            AppForge AI Studio
          </h1>
          <p className="text-xs text-slate-500 mt-2">Next-Gen Hybrid App Architect & Compiler</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 text-slate-500 font-semibold" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@appforge.ai"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-850 focus:border-violet-500/80 rounded-2xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all font-medium placeholder-slate-600 shadow-inner"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Secret Key / Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-slate-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-850 focus:border-violet-500/80 rounded-2xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all font-medium placeholder-slate-600 shadow-inner"
              />
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-sm font-bold text-white shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 w-full border-t border-slate-850" />
          <span className="relative z-10 px-3 bg-[#07080d] text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            or
          </span>
        </div>

        {/* Guest Mode Trigger */}
        <button
          onClick={handleGuestMode}
          disabled={isLoading}
          className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-2xl text-xs font-bold text-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="text-violet-500 animate-pulse" size={14} />
          Continue as Guest (Local Sandbox)
        </button>

        {/* Terms footer */}
        <div className="mt-8 flex items-center justify-center gap-1.5 text-[10px] text-slate-600 font-semibold tracking-wide">
          <ShieldCheck size={12} />
          Local databases encrypted using standard safeStorage
        </div>
      </div>
    </div>
  );
};

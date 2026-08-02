import React from 'react';
import { Sparkles, Terminal, Code2, Cpu, ArrowRight, ShieldCheck, Layers, Bot, Zap, Play } from 'lucide-react';

interface LandingPageProps {
  onLaunch: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  return (
    <div className="min-h-screen w-screen bg-[#07080d] bg-radial-gradient from-violet-950/20 via-slate-950 to-slate-950 text-slate-300 overflow-y-auto selection:bg-violet-600/30 selection:text-white relative select-none">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[140px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[140px]" />

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-20 border-b border-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-xl shadow-violet-500/20">
            AF
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            AppForge<span className="text-violet-500 text-xs font-bold align-super ml-0.5">AI</span>
          </span>
        </div>

        <button
          onClick={onLaunch}
          className="glow-button px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-violet-500/10"
        >
          Launch Studio IDE
          <ArrowRight size={14} />
        </button>
      </header>

      {/* Main Hero Container */}
      <main className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-bold uppercase tracking-widest mb-6 animate-pulse">
          <Sparkles size={12} />
          Now Powered by Gemini 3.5 Flash
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          The Next-Generation AI Software Factory
        </h1>
        
        <p className="text-sm md:text-md text-slate-400 mt-6 max-w-2xl leading-relaxed">
          Stop writing code from scratch. AppForge AI compiles natural language requirements into structured application **Blueprints (SSOT)**, enabling interactive live previews, visual edits, and code output targets for React Native and Spring Boot.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <button
            onClick={onLaunch}
            className="glow-button px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold shadow-xl shadow-violet-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Get Started Free
            <Play size={14} fill="white" />
          </button>
          
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="px-8 py-4 rounded-2xl bg-slate-950 border border-slate-850 hover:bg-slate-900/60 transition-all text-slate-300 hover:text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Terminal size={14} className="text-slate-500" />
            Read Documentation
          </a>
        </div>

        {/* Pipeline Chart */}
        <section className="w-full mt-24">
          <h2 className="text-xl font-bold text-white mb-2 tracking-wide uppercase">The AppForge Compilation Pipeline</h2>
          <p className="text-xs text-slate-500 mb-8 max-w-lg mx-auto">Our structured pipeline guarantees your app builds successfully, hot-reloads instantly, and outputs deploy-ready source archives.</p>
          
          <div className="glass-card p-6 rounded-3xl border border-slate-900 grid grid-cols-2 md:grid-cols-5 gap-4 text-left max-w-5xl mx-auto">
            {[
              { num: '01', title: 'Idea Collection', desc: 'Requirement Analyzer details product parameters.' },
              { num: '02', title: 'Project Blueprint', desc: 'Single Source of Truth maps screens, DB, and routes.' },
              { num: '03', title: 'Live Phone Preview', desc: 'Real-time interactive emulator simulation.' },
              { num: '04', title: 'Visual Editor', desc: 'Visual shifts dynamically edit blueprint JSON.' },
              { num: '05', title: 'Full Build Outputs', desc: 'Compiles signed APK, DB schema, and Spring Boot API.' },
            ].map((step, i) => (
              <div key={i} className="flex flex-col gap-2.5 p-4 rounded-xl bg-slate-950/40 border border-slate-900/50 hover:border-violet-500/20 transition-all">
                <span className="text-violet-500 font-mono font-black text-sm">{step.num}</span>
                <h4 className="text-xs font-extrabold text-white">{step.title}</h4>
                <p className="text-[10px] text-slate-500 leading-normal">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Grid highlighting Engines */}
        <section className="w-full mt-24 max-w-5xl mx-auto">
          <div className="flex justify-between items-end mb-8 text-left">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide">AI Engine Architecture</h2>
              <p className="text-xs text-slate-500 mt-1">Twelve modular capabilities engines that compile, generate, and build your projects.</p>
            </div>
            <Zap className="text-violet-400 hidden sm:block animate-bounce" size={28} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'AI Reasoning Engine', desc: 'Automatically maps high-level prompts into capabilities modules like Auth, Payments, Maps, and Messaging.', icon: Cpu },
              { title: 'Blueprint Engine (SSOT)', desc: 'Keeps layout parameters, database schema structures, and routes in a single robust project.json manifest.', icon: Layers },
              { title: 'UI Canvas Hot-Reload', desc: 'Drag-and-drop components inside an active simulator. Vite compiles visual layout edits instantly.', icon: Code2 },
              { title: 'Spring Boot Generator', desc: 'Automatically outputs JWT authentication, entities mappings, JpaRepositories, and REST controllers.', icon: Terminal },
              { title: 'Capacitor Build Wrapper', desc: 'Wraps web clients into Android capacitors, resolving packages, and outputting deployment signed APK files.', icon: ShieldCheck },
              { title: 'Global Developer Companion', desc: 'Developer chatbot answers logic questions, indexes tables, and modifies blueprints on-the-fly.', icon: Bot }
            ].map((engine, i) => {
              const Icon = engine.icon;
              return (
                <div key={i} className="glass-card p-6 rounded-2xl text-left border border-slate-900 hover:border-slate-800">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-850 text-violet-400 inline-block mb-4">
                    <Icon size={20} />
                  </div>
                  <h4 className="text-sm font-extrabold text-white tracking-wide">{engine.title}</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{engine.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full border-t border-slate-900/60 mt-28 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-600 font-semibold tracking-wide">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-violet-500" />
            Local workspace secured via secureStorage encryption.
          </div>
          <p>© 2026 AppForge AI Studio. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

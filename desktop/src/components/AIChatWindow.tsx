import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Image, Mic, RotateCcw, Bot, Sparkles, Check, 
  Database, GitFork, AlertTriangle, BookOpen
} from 'lucide-react';
import type { ChatMessage } from '../electron';
import { getOrchestrator } from '../ai/orchestrator/Orchestrator';
import { AnalyticsManager } from '../ai/analytics/AnalyticsManager';

interface AIChatWindowProps {
  projectId: number;
  activeScreen: any;
  onSelectScreen: (screen: any) => void;
  onReloadWorkspace: (overrideSelectedScreen?: any) => void;
  onBlueprintBuilt: () => void;
}

export const AIChatWindow: React.FC<AIChatWindowProps> = ({ 
  projectId, 
  activeScreen, 
  onSelectScreen, 
  onReloadWorkspace, 
  onBlueprintBuilt 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  
  // Custom states
  const [isRecording, setIsRecording] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  
  // Planner State (AppForge Intelligence Layer)
  const [plannerResult, setPlannerResult] = useState<any>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showSection, setShowSection] = useState<'features' | 'logic' | 'db_api' | 'none'>('features');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isRecording, attachedImage, plannerResult]);

  // Load chat history
  const loadChat = async () => {
    try {
      const history = await window.electronAPI.getChatHistory(projectId);
      setMessages(history);
      
      if (history.length === 0) {
        const welcomeText = "👋 Welcome to **AppForge AI**!\n\nDescribe the application you want to build below. I will automatically classify the domain, recommend modular feature packs, set up API / database tables, and design business logic workflows!\n\n*(e.g., Try typing: E-Commerce Store, Taxi booking app, or Food Delivery portal)*";
        const msg = await window.electronAPI.addChatMessage(projectId, 'assistant', welcomeText);
        setMessages([msg]);
      } else {
        // Reconstruct planner result if we already have it in the blueprint
        const details = await window.electronAPI.getProjectDetails(projectId);
        if (details.project.blueprint) {
          const bp = JSON.parse(details.project.blueprint);
          if (bp.database || bp.features) {
            setPlannerResult({
              domain: bp.name || 'Custom App',
              theme: details.project.theme || 'Dark',
              features: bp.features || [],
              users: bp.users || ['User', 'Admin'],
              businessLogic: bp.businessLogic || [],
              databaseTables: bp.database?.tables || [],
              apiEndpoints: bp.api?.endpoints || []
            });
          }
        }
      }
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }
  };

  useEffect(() => {
    loadChat();
  }, [projectId]);

  // Client-side Requirement Validator
  const validatePlan = (plan: any) => {
    const warns: string[] = [];
    if (!plan) return;

    const feats = (plan.features || []).map((f: string) => f.toLowerCase());
    const tables = (plan.databaseTables || []).map((t: any) => t.name.toLowerCase());
    const apis = (plan.apiEndpoints || []).map((a: any) => a.path.toLowerCase());

    const hasAuth = feats.some((f: string) => f.includes('auth') || f.includes('login') || f.includes('register') || f.includes('users'));
    const hasCart = feats.some((f: string) => f.includes('cart') || f.includes('payment') || f.includes('checkout') || f.includes('wallet'));
    const hasTracking = feats.some((f: string) => f.includes('track') || f.includes('location') || f.includes('gps') || f.includes('map'));

    if (hasAuth && !tables.includes('users')) {
      warns.push('Missing "users" database table to store login credentials.');
    }
    if (hasCart && !tables.includes('orders') && !tables.includes('billing') && !tables.includes('transactions')) {
      warns.push('Shopping checkout is active, but missing "orders" or "billing" tables to save transactions.');
    }
    if (hasCart && !apis.some((a: string) => a.includes('pay') || a.includes('checkout'))) {
      warns.push('Payment gateway is enabled, but missing /api/checkout/pay endpoint contracts.');
    }
    if (hasTracking && !tables.includes('coordinates') && !tables.includes('locations')) {
      warns.push('Live map views are active, but missing location tracking "coordinates" database logs.');
    }

    setWarnings(warns);
  };

  useEffect(() => {
    if (plannerResult) {
      validatePlan(plannerResult);
    }
  }, [plannerResult]);

  const handleSendMessage = async (text: string, imgPath?: string) => {
    const messageContent = text.trim();
    if (!messageContent && !imgPath) return;

    try {
      // Add User Message
      const userMsg = await window.electronAPI.addChatMessage(projectId, 'user', messageContent, imgPath || undefined);
      setMessages(prev => [...prev, userMsg]);
      setInputValue('');
      setAttachedImage(null);

      // Intercept layout / canvas commands
      const lowercaseMsg = messageContent.toLowerCase();
      
      // 1. Theme Commands
      const themeMatch = messageContent.match(/(?:change|set)?\s*theme\s+(?:to\s+)?(dark|light|material|glass|glassmorphic)/i);
      if (themeMatch) {
        const newTheme = themeMatch[1].charAt(0).toUpperCase() + themeMatch[1].slice(1).toLowerCase();
        const normalizedTheme = newTheme === 'Glassmorphic' ? 'Glass' : newTheme;
        try {
          const details = await window.electronAPI.getProjectDetails(projectId);
          const currentSettings = JSON.parse(details.project.settings || '{}');
          const updatedSettings = { ...currentSettings, theme: normalizedTheme };
          await window.electronAPI.saveSettings(projectId, updatedSettings);
          onReloadWorkspace(activeScreen);
          
          const aiMsg = await window.electronAPI.addChatMessage(
            projectId, 
            'assistant', 
            `🎨 **Theme updated successfully!** I have hot-reloaded the active theme configuration to **${normalizedTheme}**.`
          );
          setMessages(prev => [...prev, aiMsg]);
          return;
        } catch (err: any) {
          console.error(err);
        }
      }

      // 2. Screen Commands
      const screenMatch = messageContent.match(/(?:create|add)\s+(?:screen\s+)?(\w+)(?:\s+screen)?/i);
      if (screenMatch && !lowercaseMsg.includes('delete') && !lowercaseMsg.includes('remove')) {
        let screenName = screenMatch[1];
        screenName = screenName.charAt(0).toUpperCase() + screenName.slice(1);
        if (!screenName.endsWith('Screen') && screenName.toLowerCase() !== 'splash' && screenName.toLowerCase() !== 'home') {
          screenName += 'Screen';
        }

        try {
          const defaultLayout = JSON.stringify({
            elements: [
              { type: 'Heading', content: screenName },
              { type: 'Text', content: 'Design your layout.' }
            ]
          });
          const created = await window.electronAPI.createScreen(projectId, screenName, defaultLayout);
          onReloadWorkspace(created);
          onSelectScreen(created);
          
          const aiMsg = await window.electronAPI.addChatMessage(
            projectId, 
            'assistant', 
            `🖥️ **Screen "${screenName}" created successfully!** I have switched the phone preview mockup to display it.`
          );
          setMessages(prev => [...prev, aiMsg]);
          return;
        } catch (err: any) {
          const aiMsg = await window.electronAPI.addChatMessage(projectId, 'assistant', `❌ Failed to create screen: ${err.message}`);
          setMessages(prev => [...prev, aiMsg]);
          return;
        }
      }

      // 3. Component Element Commands
      const elementMatch = messageContent.match(/add\s+(button|input|header|map|grid|list|text)/i);
      if (elementMatch) {
        const elemTypeRaw = elementMatch[1].toLowerCase();
        const target = activeScreen;
        if (!target) {
          const aiMsg = await window.electronAPI.addChatMessage(
            projectId, 
            'assistant', 
            `⚠️ **No active screen selected.** Please select a screen in the left panel to insert elements.`
          );
          setMessages(prev => [...prev, aiMsg]);
          return;
        }

        let newEl: any = null;
        if (elemTypeRaw === 'button') newEl = { type: 'Button', content: 'Action Trigger' };
        else if (elemTypeRaw === 'input') newEl = { type: 'InputField', label: 'Form Input' };
        else if (elemTypeRaw === 'header') newEl = { type: 'Header', title: 'Workspace Header' };
        else if (elemTypeRaw === 'map') newEl = { type: 'MapWidget', center: 'User Geolocation' };
        else if (elemTypeRaw === 'grid') newEl = { type: 'ProductGrid', itemsCount: 2 };
        else if (elemTypeRaw === 'list') newEl = { type: 'CartList' };
        else newEl = { type: 'Text', content: 'New text element inserted.' };

        try {
          const layout = JSON.parse(target.layout_data || '{"elements":[]}');
          if (!layout.elements) layout.elements = [];
          layout.elements.push(newEl);

          await window.electronAPI.updateScreen(target.id, target.name, JSON.stringify(layout));
          onReloadWorkspace(target);

          const aiMsg = await window.electronAPI.addChatMessage(
            projectId, 
            'assistant', 
            `⚡ **Hot Reload complete!** Added a **${newEl.type}** element to **${target.name}**. The phone preview canvas has updated.`
          );
          setMessages(prev => [...prev, aiMsg]);
          return;
        } catch (err: any) {
          const aiMsg = await window.electronAPI.addChatMessage(projectId, 'assistant', `❌ Failed to update layout: ${err.message}`);
          setMessages(prev => [...prev, aiMsg]);
          return;
        }
      }

      // 4. Element Translation Shifts
      const moveMatch = messageContent.match(/move\s+(button|input|header|map|grid|list|text)\s+(down|up|left|right)/i);
      if (moveMatch) {
        const typeRaw = moveMatch[1].toLowerCase();
        const dir = moveMatch[2].toLowerCase();
        const target = activeScreen;
        if (!target) {
          const aiMsg = await window.electronAPI.addChatMessage(projectId, 'assistant', `⚠️ **No active screen.** Please select a screen from the left sidebar.`);
          setMessages(prev => [...prev, aiMsg]);
          return;
        }

        try {
          const layout = JSON.parse(target.layout_data || '{"elements":[]}');
          const elementsList = layout.elements || [];
          
          const typeMap: Record<string, string> = {
            button: 'Button',
            input: 'InputField',
            header: 'Header',
            map: 'MapWidget',
            grid: 'ProductGrid',
            list: 'CartList',
            text: 'Text'
          };
          
          const targetType = typeMap[typeRaw] || 'Button';
          const idx = elementsList.findIndex((el: any) => el.type === targetType);
          if (idx === -1) {
            const aiMsg = await window.electronAPI.addChatMessage(projectId, 'assistant', `⚠️ Could not find a **${targetType}** element on screen **${target.name}**.`);
            setMessages(prev => [...prev, aiMsg]);
            return;
          }

          const el = { ...elementsList[idx] };
          if (el.x === undefined) {
            el.x = 16; el.y = idx * 90 + 20; el.w = 262; el.h = 36;
          }

          const offset = 40;
          if (dir === 'down') el.y += offset;
          else if (dir === 'up') el.y -= offset;
          else if (dir === 'left') el.x -= offset;
          else if (dir === 'right') el.x += offset;

          // Clamp positions
          el.x = Math.max(0, Math.min(294 - (el.w || 100), el.x));
          el.y = Math.max(0, Math.min(540 - (el.h || 40), el.y));

          elementsList[idx] = el;
          await window.electronAPI.updateScreen(target.id, target.name, JSON.stringify({ elements: elementsList }));
          onReloadWorkspace(target);

          const aiMsg = await window.electronAPI.addChatMessage(
            projectId, 
            'assistant', 
            `⚡ **Layout update complete!** Moved **${targetType}** component **${dir}** by ${offset}px on screen **${target.name}**. Phone preview has hot-reloaded.`
          );
          setMessages(prev => [...prev, aiMsg]);
          return;
        } catch (err: any) {
          console.error(err);
        }
      }

      // 5. Screen route deletions
      const deleteMatch = messageContent.match(/(?:delete|remove)\s+(?:screen\s+)?(\w+)/i);
      if (deleteMatch) {
        const screenNameTarget = deleteMatch[1].toLowerCase();
        try {
          const details = await window.electronAPI.getProjectDetails(projectId);
          const currentScreens = details.screens || [];
          const targetScreen = currentScreens.find(s => 
            s.name.toLowerCase() === screenNameTarget || 
            s.name.toLowerCase() === (screenNameTarget + 'screen')
          );

          if (!targetScreen) {
            const aiMsg = await window.electronAPI.addChatMessage(projectId, 'assistant', `⚠️ Could not find screen "**${deleteMatch[1]}**" inside the active project.`);
            setMessages(prev => [...prev, aiMsg]);
            return;
          }

          await window.electronAPI.deleteScreen(targetScreen.id);

          const blueprint = JSON.parse(details.project.blueprint || '{}');
          if (blueprint.navigation && blueprint.navigation.routes) {
            blueprint.navigation.routes = blueprint.navigation.routes.filter((r: any) => 
              r.screen.toLowerCase() !== targetScreen.name.toLowerCase()
            );
          }
          if (blueprint.screens) {
            blueprint.screens = blueprint.screens.filter((s: any) => 
              s.name.toLowerCase() !== targetScreen.name.toLowerCase()
            );
          }
          await window.electronAPI.saveBlueprint(projectId, blueprint);
          onReloadWorkspace(null);

          const aiMsg = await window.electronAPI.addChatMessage(
            projectId, 
            'assistant', 
            `🗑️ **Deleted screen "${targetScreen.name}" successfully!** The blueprint routes, SQLite database registries, and navigator configurations have been updated and hot-reloaded.`
          );
          setMessages(prev => [...prev, aiMsg]);
          return;
        } catch (err: any) {
          const aiMsg = await window.electronAPI.addChatMessage(projectId, 'assistant', `❌ Deletion failed: ${err.message}`);
          setMessages(prev => [...prev, aiMsg]);
          return;
        }
      }

      // Default: Trigger AI Pipeline Orchestrator (Highest Priority execution)
      setIsThinking(true);
      
      const loadingMsg = await window.electronAPI.addChatMessage(
        projectId, 
        'assistant', 
        `🤖 **AppForge Orchestrator pipeline initiated!** Classifying intent, running domain reasoning and gap analysis for "${messageContent}"...`
      );
      setMessages(prev => [...prev, loadingMsg]);

      try {
        const orchestrator = getOrchestrator(projectId, {
          onComplete: async (blueprint) => {
            // Set planner result to update chat panel visual tabs
            setPlannerResult({
              domain: blueprint.name,
              theme: blueprint.theme.mode === 'dark' ? 'Dark' : 'Light',
              features: blueprint.intentResult?.suggestedFeatures || blueprint.requirementAnswers?.features || [],
              users: blueprint.users,
              businessLogic: blueprint.businessLogic.map(b => b.name),
              databaseTables: blueprint.database.tables,
              apiEndpoints: blueprint.api.endpoints
            });
            
            // Reload visual builder workspace data
            onReloadWorkspace(null);
            
            const metrics = new AnalyticsManager().calculateMetrics(blueprint as any);
            const warnText = metrics.warnings.length > 0 
              ? `\n\n🚨 **Missing Modules / Validation Warnings**:\n` + metrics.warnings.map(w => `• ${w}`).join('\n')
              : `\n\n🛡️ **Validation Check**: Blueprint fully compliant. High confidence score!`;

            const summaryText = `🎉 **AI Pipeline completed successfully!** Generated project blueprint for **${blueprint.name}**.\n\n` + 
              `- **Screens**: ${blueprint.screens.map(s => s.name).join(', ')}\n` + 
              `- **Database Tables**: ${blueprint.database.tables.map(t => t.name).join(', ')}\n` +
              `- **APIs**: ${blueprint.api.endpoints.map(e => e.path).join(', ')}\n\n` + 
              `📊 **AI Quality Metrics**:\n` +
              `- **Requirement Completeness**: ${metrics.requirementCompleteness}%\n` +
              `- **Blueprint Score**: ${metrics.blueprintScore}%\n` +
              `- **UI Coverage**: ${metrics.uiCoverage}%\n` +
              `- **Backend Coverage**: ${metrics.backendCoverage}%\n` +
              `- **Database Coverage**: ${metrics.databaseCoverage}%\n` +
              `- **Estimated Build Success**: ${metrics.estimatedBuildSuccess}%` + 
              warnText + 
              `\n\nGo to the **Visual Mockup Preview** or check out **Project Metrics** to see details. React Native & Spring Boot source packages, DB SQL seeds, and Deploy docs have been written to disk!`;
            
            const doneMsg = await window.electronAPI.addChatMessage(projectId, 'assistant', summaryText);
            setMessages(prev => [...prev.filter(m => m.id !== loadingMsg.id), doneMsg]);
            setIsThinking(false);
          },
          onError: async (err) => {
            const errorMsg = await window.electronAPI.addChatMessage(projectId, 'assistant', `❌ Pipeline failed: ${err}`);
            setMessages(prev => [...prev.filter(m => m.id !== loadingMsg.id), errorMsg]);
            setIsThinking(false);
          }
        });
        
        await orchestrator.run(messageContent);
      } catch (e: any) {
        console.error(e);
        setIsThinking(false);
        const errMsg = await window.electronAPI.addChatMessage(projectId, 'assistant', `❌ Intelligence layer error: ${e.message}`);
        setMessages(prev => [...prev, errMsg]);
      }
    } catch (e: any) {
      console.error(e);
      setIsThinking(false);
      const errMsg = await window.electronAPI.addChatMessage(projectId, 'assistant', `❌ Intelligence layer error: ${e.message}`);
      setMessages(prev => [...prev, errMsg]);
    }
  };

  const handleToggleFeature = (feature: string) => {
    if (!plannerResult) return;
    const updatedFeatures = plannerResult.features.includes(feature)
      ? plannerResult.features.filter((f: string) => f !== feature)
      : [...plannerResult.features, feature];

    setPlannerResult({
      ...plannerResult,
      features: updatedFeatures
    });
  };

  const handleCompileBlueprint = async () => {
    if (!plannerResult) return;
    
    // Simulate compilation latency
    const compilingMsg = await window.electronAPI.addChatMessage(
      projectId, 
      'assistant', 
      "⚙️ **Blueprint Engine compiles schemas, routes, and workspace folders...**"
    );
    setMessages(prev => [...prev, compilingMsg]);

    try {
      const result = await window.electronAPI.buildBlueprint(projectId, plannerResult);
      
      const finalMsgText = `✅ **Workspace blueprint generated successfully!**

The local database and filesystem folders have been structured.
- **Project Domain**: ${result.blueprint.name}
- **Active Screens**: ${result.blueprint.screens?.map((s: any) => s.name).join(', ')}
- **Database Tables**: ${result.blueprint.database?.tables?.map((t: any) => t.name).join(', ')}
- **API Paths**: ${result.blueprint.api?.endpoints?.map((e: any) => e.path).join(', ')}

You can now design screen layout wireframes on the canvas or press **Generate Code App** at the top toolbar.`;

      const successMsg = await window.electronAPI.addChatMessage(projectId, 'assistant', finalMsgText);
      setMessages(prev => {
        const filtered = prev.filter(m => !m.content.includes('Blueprint Engine compiles'));
        return [...filtered, successMsg];
      });

      onBlueprintBuilt();
    } catch (e: any) {
      console.error(e);
      const errorMsg = await window.electronAPI.addChatMessage(
        projectId, 
        'assistant', 
        `❌ Blueprint build failure: ${e.message}`
      );
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleClearHistory = async () => {
    try {
      await window.electronAPI.clearChatHistory(projectId);
      setPlannerResult(null);
      setWarnings([]);
      await loadChat();
    } catch (e) {
      console.error(e);
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setInputValue('Create an E-Commerce Shop application');
    }, 2000);
  };

  const handleAttachImage = () => {
    setAttachedImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80');
  };

  return (
    <div className="w-96 flex flex-col h-full bg-slate-950/80 border-l border-slate-900 overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-violet-400" />
          <h4 className="text-sm font-bold text-white tracking-wide">AppForge Intelligence</h4>
        </div>
        <button
          onClick={handleClearHistory}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-white hover:border-violet-500 transition-all cursor-pointer"
          title="Reset Planner"
        >
          <RotateCcw size={13} />
        </button>
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((m) => {
          const isAI = m.role === 'assistant';
          return (
            <div key={m.id} className={`flex gap-3 max-w-[85%] ${isAI ? 'self-start' : 'self-end flex-row-reverse'}`}>
              {isAI && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow shadow-violet-500/25 flex-shrink-0">
                  <Bot size={16} />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isAI
                      ? 'bg-slate-900 border border-slate-850 text-slate-300 rounded-tl-none'
                      : 'bg-violet-600 text-white rounded-tr-none font-medium shadow-md shadow-violet-500/10'
                  }`}
                  style={{ whiteSpace: isAI ? 'normal' : 'pre-wrap' }}
                >
                  {/* Dynamic Markdown/Text Renderer */}
                  {m.content.split('\n').map((line, idx) => {
                    if (line.startsWith('- ')) {
                      return (
                        <span key={idx} className="block pl-4 relative my-0.5">
                          <span className="absolute left-1 top-2 w-1.5 h-1.5 rounded-full bg-violet-400" />
                          {line.substring(2)}
                        </span>
                      );
                    }
                    if (line.startsWith('**')) {
                      return <strong key={idx} className="block font-black text-white mt-1">{line.replace(/\*\*/g, '')}</strong>;
                    }
                    return <span key={idx} className="block min-h-[0.5rem]">{line}</span>;
                  })}
                  
                  {m.image_path && (
                    <div className="mt-2.5 rounded-lg overflow-hidden border border-slate-800">
                      <img src={m.image_path} alt="attached specs" className="max-w-full h-auto object-cover max-h-40" />
                    </div>
                  )}
                </div>
                <span className={`text-[9px] text-slate-600 ${isAI ? 'self-start' : 'self-end'}`}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="self-start max-w-[85%] flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow shadow-violet-500/25 flex-shrink-0">
              <Bot size={16} />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="p-3 bg-slate-900 border border-slate-850 rounded-2xl rounded-tl-none flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold animate-pulse">Analyzing Message Intent</span>
                <span className="flex gap-1 items-center h-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          </div>
        )}

        {isRecording && (
          <div className="self-end max-w-[85%] flex flex-col gap-1.5">
            <div className="p-3 bg-violet-600/10 border border-violet-500/30 rounded-2xl rounded-tr-none flex items-center gap-3">
              <span className="text-xs text-violet-400 font-semibold animate-pulse">Recording specs...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Dynamic Intelligence Planner Card */}
      {plannerResult && (
        <div className="mx-4 mb-4 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-xl max-h-[45%]">
          {/* Header */}
          <div className="p-3 bg-slate-950 border-b border-slate-850 flex justify-between items-center">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Planner Dashboard</span>
              <h5 className="text-xs font-black text-white truncate max-w-[150px]">{plannerResult.domain}</h5>
            </div>
            <button 
              onClick={handleCompileBlueprint}
              className="glow-button px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 text-white font-bold text-[10px] cursor-pointer"
            >
              Compile Blueprint
            </button>
          </div>

          {/* Sub-tabs Selector */}
          <div className="flex bg-slate-950/40 p-1 border-b border-slate-850">
            {[
              { id: 'features', name: 'Features', icon: BookOpen },
              { id: 'logic', name: 'Workflow', icon: GitFork },
              { id: 'db_api', name: 'APIs & DB', icon: Database }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setShowSection(tab.id as any)}
                className={`flex-1 flex justify-center items-center gap-1 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                  showSection === tab.id ? 'bg-slate-850 text-white' : 'text-slate-500 hover:text-slate-350'
                }`}
              >
                <tab.icon size={10} />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Warnings list */}
          {warnings.length > 0 && (
            <div className="px-3 py-1.5 bg-amber-500/10 border-b border-amber-500/20 flex gap-2 items-start">
              <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={12} />
              <div className="flex flex-col gap-0.5">
                {warnings.map((w, idx) => (
                  <span key={idx} className="text-[8px] text-amber-400 font-semibold leading-relaxed">{w}</span>
                ))}
              </div>
            </div>
          )}

          {/* Panel details scroll container */}
          <div className="flex-1 overflow-y-auto p-3 text-left">
            {showSection === 'features' && (
              <div className="flex flex-col gap-2">
                <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">Toggle Recommended Features:</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {plannerResult.features.map((feat: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleToggleFeature(feat)}
                      className={`flex items-center gap-1.5 p-2 rounded-xl text-[10px] font-bold border transition-all text-left cursor-pointer ${
                        plannerResult.features.includes(feat)
                          ? 'bg-violet-600/15 border-violet-500/40 text-violet-300'
                          : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300 hover:border-slate-800'
                      }`}
                    >
                      <Check size={11} className={plannerResult.features.includes(feat) ? 'opacity-100' : 'opacity-20'} />
                      <span className="truncate">{feat}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showSection === 'logic' && (
              <div className="flex flex-col gap-2 font-mono text-[9px] text-slate-400">
                <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest font-sans mb-1">Business Logic Execution:</span>
                {plannerResult.businessLogic?.map((step: string, idx: number) => (
                  <div key={idx} className="flex gap-2.5 items-start pl-2 relative border-l border-slate-800 pb-2.5 last:pb-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 absolute left-[-4px] top-1.5" />
                    <span className="text-slate-500 font-bold">{idx + 1}.</span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            )}

            {showSection === 'db_api' && (
              <div className="flex flex-col gap-4 font-mono text-[9px] text-slate-400">
                {/* Database tables checklist */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest font-sans">Tables Planner:</span>
                  {plannerResult.databaseTables?.map((t: any, idx: number) => (
                    <div key={idx} className="p-2 bg-slate-950 border border-slate-850 rounded-xl">
                      <span className="text-violet-400 font-extrabold">📁 {t.name}</span>
                      <div className="text-[8px] text-slate-500 mt-1 pl-2 border-l border-slate-850 flex flex-wrap gap-x-2">
                        {t.columns?.map((c: string, cIdx: number) => (
                          <span key={cIdx}>{c}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* API endpoints checklist */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest font-sans">API Endpoint planner:</span>
                  {plannerResult.apiEndpoints?.map((api: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-1.5 bg-slate-950 border border-slate-850 rounded-xl">
                      <span className="text-[8px] font-black uppercase text-indigo-400">{api.method}</span>
                      <span className="text-slate-350">{api.path}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pill Suggestions */}
      {!plannerResult && (
        <div className="px-4 mb-1">
          <div className="flex flex-wrap gap-2">
            {['Food Delivery App', 'Taxi Booking App', 'E-Commerce Store', 'Hospital portal'].map(pill => (
              <button
                key={pill}
                onClick={() => handleSendMessage(pill)}
                className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-slate-900 border border-slate-805 text-slate-400 hover:border-violet-500/50 hover:text-white transition-all cursor-pointer"
              >
                {pill}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Text Inputs panel */}
      <div className="p-4 border-t border-slate-900 bg-slate-950 flex flex-col gap-3">
        {attachedImage && (
          <div className="relative self-start">
            <img src={attachedImage} alt="attached thumbnail" className="w-12 h-12 object-cover rounded-lg border border-slate-800" />
            <button 
              onClick={() => setAttachedImage(null)}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-[9px] flex items-center justify-center cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-850 rounded-2xl px-3 py-1">
          <button 
            onClick={handleAttachImage}
            className="p-1.5 text-slate-500 hover:text-white transition-colors cursor-pointer"
            title="Attach Screen mockup image"
          >
            <Image size={16} />
          </button>
          <button 
            onClick={handleVoiceInput}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isRecording ? 'text-rose-500 bg-rose-500/10' : 'text-slate-505 hover:text-white'}`}
            title="Voice spec input"
          >
            <Mic size={16} />
          </button>
          
          <input
            type="text"
            placeholder="Describe your app features..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
            className="flex-1 bg-transparent text-xs py-2 text-slate-200 focus:outline-none placeholder:text-slate-600"
          />
          
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() && !attachedImage}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              inputValue.trim() || attachedImage
                ? 'bg-violet-600 text-white hover:bg-violet-500 shadow shadow-violet-500/20'
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

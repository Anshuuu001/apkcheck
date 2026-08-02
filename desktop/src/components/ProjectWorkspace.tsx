import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, Smartphone, Cpu, Database, Network, Key, ArrowRight, Layout, RotateCcw } from 'lucide-react';
import { AIChatWindow } from './AIChatWindow';
import type { Project, Screen, Component } from '../electron';
import { useBlueprintStore } from '../store/blueprintStore';

import { AnalyticsManager } from '../ai/analytics/AnalyticsManager';

interface ProjectWorkspaceProps {
  projectId: number;
  onBackToDashboard: () => void;
}

type TabType = 'visual-builder' | 'blueprint-inspector' | 'project-metrics';
type BlueprintTabType = 'db' | 'api' | 'routes';

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({ projectId, onBackToDashboard }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [components, setComponents] = useState<Component[]>([]);
  
  // Selected items states
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  
  // Preview Runtime interactive prototype states
  const [isPreviewLandscape, setIsPreviewLandscape] = useState(false);
  const [isMockLoading, setIsMockLoading] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([
    { id: 101, name: 'Taco Shell Meal', price: 9.99, quantity: 1 },
    { id: 102, name: 'Cheesy Garlic Bread', price: 5.49, quantity: 1 }
  ]);
  const [chatMessagesHistory, setChatMessagesHistory] = useState<any[]>([
    { sender: 'agent', text: 'Hello! Welcome to Support. How can we help you today?' }
  ]);
  const [chatInputText, setChatInputText] = useState('');

  // Mock databases for CRUD simulations
  const [appointments, setAppointments] = useState<any[]>([
    { id: 1, doctor: 'Dr. Jane Smith', time: '10:00 AM', date: 'Today', status: 'CONFIRMED' },
    { id: 2, doctor: 'Dr. John Doe', time: '02:30 PM', date: 'Tomorrow', status: 'PENDING' }
  ]);
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, title: 'Appointment Confirmed', body: 'Your visit with Dr. Jane Smith is scheduled.', is_read: false },
    { id: 2, title: 'Lab Results Ready', body: 'Diagnostic blood report is uploaded.', is_read: true }
  ]);
  const [itemsList, setItemsList] = useState<any[]>([
    { id: 1, title: 'Item Alpha', description: 'Primary inventory item.' },
    { id: 2, title: 'Item Beta', description: 'Secondary backup stock.' }
  ]);
  const [newItemTitle, setNewItemTitle] = useState('');
  
  // Interactive forms states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerMockupToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleMockupNavigate = (screenName: string) => {
    const target = screenName.toLowerCase().replace('screen', '');
    const found = screens.find(s => {
      const sName = s.name.toLowerCase().replace('screen', '');
      return sName === target;
    });
    setIsMockLoading(true);
    setTimeout(() => {
      setIsMockLoading(false);
      if (found) {
        setSelectedScreen(found);
        triggerMockupToast(`Navigated to ${found.name}`);
      } else {
        const loose = screens.find(s => s.name.toLowerCase().includes(target));
        if (loose) {
          setSelectedScreen(loose);
          triggerMockupToast(`Navigated to ${loose.name}`);
        }
      }
    }, 450);
  };
  const [activeTab, setActiveTab] = useState<TabType>('visual-builder');
  const [activeBlueprintTab, setActiveBlueprintTab] = useState<BlueprintTabType>('db');
  
  // Dialog/Modal states for creating items
  const [isAddScreenOpen, setIsAddScreenOpen] = useState(false);
  const [isAddComponentOpen, setIsAddComponentOpen] = useState(false);
  const [newScreenName, setNewScreenName] = useState('');
  const [newCompName, setNewCompName] = useState('');
  const [newCompType, setNewCompType] = useState('Button');
  const [errorMsg, setErrorMsg] = useState('');

  // Code generation state variables (Phase 3)
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [generationLog, setGenerationLog] = useState<string[]>([]);
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [filesGenerated, setFilesGenerated] = useState<string[]>([]);

  // Build system state variables (Phase 10)
  const [isBuildingRelease, setIsBuildingRelease] = useState(false);
  const [buildLog, setBuildLog] = useState<string[]>([]);
  const [buildResult, setBuildResult] = useState<{ success: boolean; apkPath: string; zipPath: string; exportDir: string } | null>(null);
  const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);

  // Normalized element states for Drag-and-Resize interactions
  const [normElements, setNormElements] = useState<any[]>([]);
  const [selectedElementIndex, setSelectedElementIndex] = useState<number | null>(null);
  
  // Dragging and Resizing state variables
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementOriginalPos, setElementOriginalPos] = useState({ x: 0, y: 0 });
  const [elementOriginalSize, setElementOriginalSize] = useState({ w: 0, h: 0 });

  // Undo/Redo stack states
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Sync elements layout state and push history
  const updateScreenElements = async (newElements: any[], shouldPushHistory = true) => {
    if (!selectedScreen || !project) return;
    const newLayoutJson = JSON.stringify({ elements: newElements });

    const updatedScreen = {
      ...selectedScreen,
      layout_data: newLayoutJson
    };
    setSelectedScreen(updatedScreen);
    setScreens(prev => prev.map(s => s.id === selectedScreen.id ? updatedScreen : s));

    if (shouldPushHistory) {
      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push(newLayoutJson);
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
    }

    try {
      await window.electronAPI.updateScreen(selectedScreen.id, selectedScreen.name, newLayoutJson);
      
      // Update blueprint as single source of truth
      const bp = getBlueprint();
      if (bp) {
        if (!bp.screens) bp.screens = [];
        const matchIdx = bp.screens.findIndex((s: any) => s.name.toLowerCase() === selectedScreen.name.toLowerCase());
        if (matchIdx !== -1) {
          bp.screens[matchIdx].layout = { elements: newElements };
        } else {
          bp.screens.push({
            id: selectedScreen.id ? `screen_${selectedScreen.id}` : `screen_${Math.random().toString(36).substring(7)}`,
            name: selectedScreen.name,
            route: `/${selectedScreen.name.replace('Screen', '').toLowerCase()}`,
            type: 'custom',
            title: selectedScreen.name,
            description: 'Custom screen',
            userRoles: bp.users || ['User'],
            components: [],
            layout: { elements: newElements }
          });
        }
        await window.electronAPI.saveBlueprint(project.id, bp);
      } else {
        await window.electronAPI.syncProject(project.id);
      }
    } catch (e) {
      console.error('Failed to update screen layout:', e);
    }
  };

  // Undo/Redo commands handlers
  const handleUndo = async () => {
    if (historyIndex <= 0 || !selectedScreen || !project) return;
    const prevIndex = historyIndex - 1;
    const prevLayoutJson = history[prevIndex];
    setHistoryIndex(prevIndex);

    const updatedScreen = {
      ...selectedScreen,
      layout_data: prevLayoutJson
    };
    setSelectedScreen(updatedScreen);
    setScreens(prev => prev.map(s => s.id === selectedScreen.id ? updatedScreen : s));
    setSelectedElementIndex(null);

    try {
      await window.electronAPI.updateScreen(selectedScreen.id, selectedScreen.name, prevLayoutJson);
      await window.electronAPI.syncProject(project.id);
    } catch (e) {
      console.error('Undo layout failure:', e);
    }
  };

  const handleRedo = async () => {
    if (historyIndex >= history.length - 1 || !selectedScreen || !project) return;
    const nextIndex = historyIndex + 1;
    const nextLayoutJson = history[nextIndex];
    setHistoryIndex(nextIndex);

    const updatedScreen = {
      ...selectedScreen,
      layout_data: nextLayoutJson
    };
    setSelectedScreen(updatedScreen);
    setScreens(prev => prev.map(s => s.id === selectedScreen.id ? updatedScreen : s));
    setSelectedElementIndex(null);

    try {
      await window.electronAPI.updateScreen(selectedScreen.id, selectedScreen.name, nextLayoutJson);
      await window.electronAPI.syncProject(project.id);
    } catch (e) {
      console.error('Redo layout failure:', e);
    }
  };

  // Initialize and trace history on screen selection
  useEffect(() => {
    if (selectedScreen) {
      setHistory([selectedScreen.layout_data]);
      setHistoryIndex(0);
      setSelectedElementIndex(null);
    } else {
      setHistory([]);
      setHistoryIndex(-1);
      setSelectedElementIndex(null);
    }
  }, [selectedScreen?.id]);

  // Normalize raw layout elements coordinates (only on screen ID change to avoid infinite loop)
  useEffect(() => {
    if (selectedScreen) {
      const parsed = parseJson(selectedScreen.layout_data);
      const raw = parsed.elements || [];
      let changed = false;
      const normalized = raw.map((el: any, idx: number) => {
        const copy = { ...el };
        if (copy.x === undefined) {
          copy.x = 16;
          copy.y = idx * 90 + (raw[idx - 1]?.type === 'Header' ? 65 : 20);
          copy.w = 262;
          if (copy.type === 'Header') {
            copy.x = 0;
            copy.y = 0;
            copy.w = 294;
            copy.h = 44;
          } else if (copy.type === 'Navbar') {
            copy.x = 0;
            copy.y = 480;
            copy.w = 294;
            copy.h = 44;
          } else if (copy.type === 'ProductGrid') {
            copy.h = 120;
          } else if (copy.type === 'MapWidget') {
            copy.h = 120;
          } else if (copy.type === 'ChatWidget') {
            copy.h = 130;
          } else if (copy.type === 'Text') {
            copy.h = 45;
          } else {
            copy.h = 36;
          }
          changed = true;
        }
        return copy;
      });

      setNormElements(normalized);
      // Only save back to DB if we actually added missing coordinate defaults
      // Use a microtask to avoid triggering during the same render cycle
      if (changed) {
        const layoutJson = JSON.stringify({ elements: normalized });
        Promise.resolve().then(() => {
          window.electronAPI.updateScreen(selectedScreen.id, selectedScreen.name, layoutJson)
            .catch((e) => console.error('Coordinate normalization save failed:', e));
        });
      }
    } else {
      setNormElements([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedScreen?.id]); // Only re-run on screen switch, NOT on layout_data changes (prevents loop)

  // Drag-and-Resize Mouse handlers
  const handleElementMouseDown = (e: React.MouseEvent, idx: number) => {
    if ((e.target as HTMLElement).closest('.editor-control-btn')) return;
    e.preventDefault();
    setSelectedElementIndex(idx);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setElementOriginalPos({ x: normElements[idx].x, y: normElements[idx].y });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setElementOriginalSize({ w: normElements[idx].w, h: normElements[idx].h });
  };

  const handleDuplicateComponent = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = normElements[idx];
    const clone = {
      ...target,
      x: Math.min(294 - target.w, target.x + 15),
      y: Math.min(540 - target.h, target.y + 15)
    };
    const updated = [...normElements];
    updated.splice(idx + 1, 0, clone);
    updateScreenElements(updated);
    setSelectedElementIndex(idx + 1);
  };

  const handleDeleteCanvasComponent = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = normElements.filter((_, i) => i !== idx);
    updateScreenElements(updated);
    setSelectedElementIndex(null);
  };

  // Window drag/resize tracking listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && selectedElementIndex !== null) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        const updated = [...normElements];
        let newX = Math.round(elementOriginalPos.x + dx);
        let newY = Math.round(elementOriginalPos.y + dy);

        newX = Math.max(0, Math.min(294 - updated[selectedElementIndex].w, newX));
        newY = Math.max(0, Math.min(540 - updated[selectedElementIndex].h, newY));

        updated[selectedElementIndex] = {
          ...updated[selectedElementIndex],
          x: newX,
          y: newY
        };
        setNormElements(updated);
      }

      if (isResizing && selectedElementIndex !== null) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        const updated = [...normElements];
        let newW = Math.round(elementOriginalSize.w + dx);
        let newH = Math.round(elementOriginalSize.h + dy);

        newW = Math.max(40, Math.min(294 - updated[selectedElementIndex].x, newW));
        newH = Math.max(20, Math.min(540 - updated[selectedElementIndex].y, newH));

        updated[selectedElementIndex] = {
          ...updated[selectedElementIndex],
          w: newW,
          h: newH
        };
        setNormElements(updated);
      }
    };

    const handleMouseUp = () => {
      if (isDragging || isResizing) {
        setIsDragging(false);
        setIsResizing(false);
        updateScreenElements(normElements);
      }
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, selectedElementIndex, dragStart, elementOriginalPos, elementOriginalSize, normElements]);

  // Listen to Build system progress logs (Phase 10)
  useEffect(() => {
    let isActive = true;
    window.electronAPI.onBuildLog((data) => {
      if (isActive && data.projectId === projectId) {
        setBuildLog(prev => [...prev, data.message]);
      }
    });

    return () => {
      isActive = false;
      window.electronAPI.removeBuildLogListener();
    };
  }, [projectId]);

  const handleBuildRelease = async () => {
    setIsBuildingRelease(true);
    setIsBuildModalOpen(true);
    setBuildLog([
      '[Build] Initialising AppForge Android Build System...',
      '[Build] Validating local workspace dependencies...'
    ]);
    setBuildResult(null);
    try {
      const result = await window.electronAPI.buildRelease(projectId);
      setBuildResult(result);
    } catch (err: any) {
      setBuildLog(prev => [...prev, `[Error] ${err.message || 'Build pipeline encountered an error'}`]);
    } finally {
      setIsBuildingRelease(false);
    }
  };

  // Theme changer handler
  const handleThemeChange = async (newTheme: string) => {
    if (!project) return;
    try {
      const currentSettings = parseJson(project.settings);
      const updatedSettings = {
        ...currentSettings,
        theme: newTheme
      };
      await window.electronAPI.saveSettings(projectId, updatedSettings);
      loadWorkspaceData();
    } catch (e) {
      console.error('Failed to change theme settings:', e);
    }
  };

  // Code generation handler
  const handleGenerateCode = async () => {
    if (!project) return;
    setIsGenerating(true);
    setGenProgress(10);
    setGenerationLog(['Initializing AppForge Code Generator...', 'Reading SQLite project database...', 'Validating local blueprint configuration...']);
    
    setTimeout(() => {
      setGenProgress(35);
      setGenerationLog(prev => [
        ...prev,
        'Compiling screen blueprints (Splash, Login, Signup, Home, Settings)...',
        'Exporting reusable React TypeScript components (Button, Card, Text, Image, Form, Search)...'
      ]);
    }, 600);

    setTimeout(() => {
      setGenProgress(70);
      setGenerationLog(prev => [
        ...prev,
        'Assembling React Router Navigation Graph (Splash -> Login -> Signup -> Home -> Settings)...',
        `Injecting ${project.theme} Theme variables and Tailwind CSS custom classes...`
      ]);
    }, 1200);

    setTimeout(async () => {
      try {
        const result = await window.electronAPI.generateCodeAssets(projectId);
        setGenProgress(100);
        setGenerationLog(prev => [...prev, `🎉 React application generated successfully! Created ${result.filesGenerated.length} source files.`]);
        setFilesGenerated(result.filesGenerated);
        setIsGenerating(false);
        setIsGenModalOpen(true);
      } catch (err: any) {
        setIsGenerating(false);
        setErrorMsg(err.message || 'Generation failed');
      }
    }, 1800);
  };

  // Load project workspace assets
  const loadWorkspaceData = async (overrideSelectedScreen?: Screen | null) => {
    try {
      setErrorMsg('');
      const data = await window.electronAPI.getProjectDetails(projectId);
      setProject(data.project);
      setScreens(data.screens || []);
      setComponents(data.components || []);

      // Initialize master blueprint in Zustand store
      if (data.project && data.project.blueprint) {
        try {
          const parsed = JSON.parse(data.project.blueprint);
          useBlueprintStore.getState().initBlueprint(parsed, data.project.name);
        } catch (bpErr) {
          console.warn('[ProjectWorkspace] Failed to parse blueprint to Zustand:', bpErr);
        }
      }
      
      const targetScreen = overrideSelectedScreen !== undefined ? overrideSelectedScreen : selectedScreen;

      // Auto-select first screen if none is selected
      if (data.screens && data.screens.length > 0 && !targetScreen) {
        setSelectedScreen(data.screens[0]);
      } else if (data.screens && data.screens.length > 0) {
        // Keep selection updated
        const updated = data.screens.find(s => s.id === targetScreen?.id);
        setSelectedScreen(updated || data.screens[0]);
      } else {
        setSelectedScreen(null);
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to load workspace files.');
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, [projectId]);

  // Screen CRUD actions
  const handleAddScreen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScreenName.trim()) return;
    try {
      const name = newScreenName.trim();
      const defaultLayout = {
        elements: [
          { type: 'Heading', content: name },
          { type: 'Text', content: 'Design your layout.' }
        ]
      };
      
      const bp = getBlueprint();
      if (bp) {
        if (!bp.screens) bp.screens = [];
        // Check duplicate
        if (!bp.screens.some((s: any) => s.name.toLowerCase() === name.toLowerCase())) {
          bp.screens.push({
            id: `screen_${Math.random().toString(36).substring(7)}`,
            name,
            route: `/${name.replace('Screen', '').toLowerCase()}`,
            type: 'custom',
            title: name,
            description: 'Custom added screen',
            userRoles: bp.users || ['User'],
            components: [],
            layout: defaultLayout
          });
          
          if (bp.navigation && bp.navigation.routes) {
            bp.navigation.routes.push({
              path: `/${name.replace('Screen', '').toLowerCase()}`,
              screen: name
            });
          }

          await window.electronAPI.saveBlueprint(projectId, bp);
        }
      } else {
        await window.electronAPI.createScreen(projectId, name, JSON.stringify(defaultLayout));
      }
      
      setNewScreenName('');
      setIsAddScreenOpen(false);
      await loadWorkspaceData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating screen');
    }
  };

  const handleDeleteScreen = async (screenId: number) => {
    try {
      const screenToDelete = screens.find(s => s.id === screenId);
      const bp = getBlueprint();
      if (bp && screenToDelete) {
        bp.screens = bp.screens.filter((s: any) => s.name.toLowerCase() !== screenToDelete.name.toLowerCase());
        if (bp.navigation && bp.navigation.routes) {
          bp.navigation.routes = bp.navigation.routes.filter((r: any) => r.screen.toLowerCase() !== screenToDelete.name.toLowerCase());
        }
        await window.electronAPI.saveBlueprint(projectId, bp);
      } else {
        await window.electronAPI.deleteScreen(screenId);
      }
      const nextSelected = selectedScreen?.id === screenId ? null : selectedScreen;
      await loadWorkspaceData(nextSelected);
    } catch (err: any) {
      setErrorMsg('Failed to delete screen.');
    }
  };

  // Component CRUD actions
  const handleAddComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName.trim()) return;
    try {
      const name = newCompName.trim();
      const defaultConfig = {
        style: 'primary',
        label: name,
        rounded: true
      };
      
      const bp = getBlueprint();
      if (bp) {
        if (!bp.components) bp.components = [];
        if (!bp.components.some((c: any) => c.name.toLowerCase() === name.toLowerCase())) {
          bp.components.push({
            id: `comp_${Math.random().toString(36).substring(7)}`,
            name,
            type: newCompType,
            config: defaultConfig,
            props: {}
          });
          await window.electronAPI.saveBlueprint(projectId, bp);
        }
      } else {
        await window.electronAPI.createComponent(projectId, name, newCompType, JSON.stringify(defaultConfig));
      }
      
      setNewCompName('');
      setIsAddComponentOpen(false);
      await loadWorkspaceData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating component');
    }
  };

  const handleDeleteComponent = async (compId: number) => {
    try {
      const compToDelete = components.find(c => c.id === compId);
      const bp = getBlueprint();
      if (bp && compToDelete) {
        bp.components = bp.components.filter((c: any) => c.name.toLowerCase() !== compToDelete.name.toLowerCase());
        await window.electronAPI.saveBlueprint(projectId, bp);
      } else {
        await window.electronAPI.deleteComponent(compId);
      }
      await loadWorkspaceData();
    } catch (e) {
      setErrorMsg('Failed to delete component.');
    }
  };

  // Safe parse for JSON config data
  const parseJson = (str: string) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return {};
    }
  };

  // Get current parsed blueprint from project
  const getBlueprint = () => {
    if (!project || !project.blueprint) return null;
    return parseJson(project.blueprint);
  };

  const blueprint = getBlueprint();

  // Retrieve theme visual properties for simulated preview mockup
  const getPhoneThemeClasses = () => {
    const t = project?.theme?.toLowerCase() || 'dark';
    if (t === 'light') {
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-800',
        textMuted: 'text-slate-500',
        card: 'bg-white border-slate-200 border text-slate-800 rounded-2xl shadow-sm',
        button: 'bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl',
        input: 'bg-slate-200/50 border border-slate-350 text-slate-800 placeholder-slate-400 rounded-xl',
        header: 'bg-white border-b border-slate-200 text-slate-800 rounded-none',
        notch: 'bg-slate-900 text-slate-400',
        navbar: 'bg-white border-t border-slate-200 text-slate-500',
        border: 'border-slate-200'
      };
    }
    if (t === 'material') {
      return {
        bg: 'bg-[#eeeeee]',
        text: 'text-[#212121]',
        textMuted: 'text-[#757575]',
        card: 'bg-white shadow-[0_2px_5px_rgba(0,0,0,0.1)] rounded-none border border-slate-250 text-[#212121]',
        button: 'bg-[#6200ee] text-white rounded-sm uppercase tracking-wider font-bold shadow-sm',
        input: 'bg-transparent border-b-2 border-slate-300 text-slate-850 placeholder-slate-400 rounded-none',
        header: 'bg-[#6200ee] text-white rounded-none shadow-md',
        notch: 'bg-slate-950 text-slate-500',
        navbar: 'bg-white border-t border-slate-300 text-slate-650',
        border: 'border-slate-300'
      };
    }
    if (t === 'glass') {
      return {
        bg: 'bg-gradient-to-br from-[#0c0e1a] via-[#1c1d35] to-[#040816]',
        text: 'text-slate-100',
        textMuted: 'text-slate-400',
        card: 'bg-white/5 border border-white/10 backdrop-blur-md text-slate-200 rounded-2xl shadow-lg',
        button: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-violet-500/10',
        input: 'bg-black/40 border border-white/10 text-slate-200 placeholder-slate-500 rounded-xl',
        header: 'bg-white/5 border-b border-white/10 text-white backdrop-blur-md rounded-none',
        notch: 'bg-slate-950 text-slate-500',
        navbar: 'bg-white/5 border-t border-white/10 text-slate-300',
        border: 'border-white/10'
      };
    }
    // Default: Dark
    return {
      bg: 'bg-[#08090d]',
      text: 'text-white',
      textMuted: 'text-slate-400',
      card: 'bg-[#181a24] border border-slate-850 text-[#c5c6c7] rounded-2xl',
      button: 'bg-violet-600 hover:bg-violet-500 text-white rounded-xl',
      input: 'bg-[#08090d] border border-slate-800 text-slate-300 placeholder-slate-500 rounded-xl',
      header: 'bg-[#181a24] border-b border-slate-850 text-white rounded-none',
      notch: 'bg-slate-900 text-slate-500',
      navbar: 'bg-[#181a24] border-t border-slate-850 text-slate-400',
      border: 'border-slate-850'
    };
  };

  const pt = getPhoneThemeClasses();

  const renderMockupElement = (el: any, _index?: number) => {
    switch (el.type) {
      case 'Heading':
        return (
          <h3 className={`text-xs font-black tracking-wide w-full h-full flex items-center ${pt.text}`}>
            {el.content}
          </h3>
        );
      case 'Text':
        return (
          <p className={`text-[10px] leading-relaxed w-full h-full overflow-hidden ${pt.textMuted}`}>
            {el.content}
          </p>
        );
      case 'Header':
        return (
          <div className={`w-full h-full px-3 flex items-center justify-between ${pt.header}`}>
            <button 
              onClick={(e) => { e.stopPropagation(); handleMockupNavigate('Home'); }}
              className="text-[9px] font-black text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
            >
              ← Home
            </button>
            <span className="text-[10px] font-black tracking-wide truncate max-w-[120px]">{el.title || 'AppHeader'}</span>
            <div className="w-3.5 h-3.5 rounded-full bg-slate-700/30" />
          </div>
        );
      case 'Button':
        return (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              const action = (el.content || '').toLowerCase();
              if (action.includes('login') || action.includes('sign in')) {
                if (!loginEmail.includes('@') || loginPassword.length < 4) {
                  setFormErrors({ login: 'Invalid email or password (min 4 characters)' });
                  triggerMockupToast('❌ Login Validation Failed');
                } else {
                  setFormErrors({});
                  triggerMockupToast('✅ Welcome Back!');
                  handleMockupNavigate('Home');
                }
              } else if (action.includes('register') || action.includes('sign up')) {
                if (!signupEmail.includes('@') || signupPassword.length < 4 || !signupName) {
                  setFormErrors({ signup: 'Please fill out all fields correctly (pwd min 4)' });
                  triggerMockupToast('❌ Registration Failed');
                } else {
                  setFormErrors({});
                  triggerMockupToast('✅ Account Created!');
                  handleMockupNavigate('Login');
                }
              } else if (action.includes('checkout')) {
                handleMockupNavigate('Payment');
              } else if (action.includes('pay') || action.includes('confirm')) {
                triggerMockupToast('💰 Payment Processed successfully!');
                setCartItems([]);
                setTimeout(() => {
                  handleMockupNavigate('Home');
                }, 1000);
              } else if (action.includes('started')) {
                handleMockupNavigate('Login');
              } else {
                handleMockupNavigate(el.content || 'Home');
              }
            }}
            className={`w-full h-full font-bold text-[10px] shadow-sm flex items-center justify-center transition-all cursor-pointer active:scale-95 ${pt.button}`}
          >
            {el.content || 'Tap Button'}
          </button>
        );
      case 'InputField': {
        const isEmail = (el.label || '').toLowerCase().includes('email');
        const isPassword = (el.label || '').toLowerCase().includes('password');
        const isName = (el.label || '').toLowerCase().includes('name') || (el.label || '').toLowerCase().includes('full');
        
        let val = '';
        let onChange = (_e: any) => {};
        if (isEmail) {
          val = selectedScreen?.name.toLowerCase().includes('signup') ? signupEmail : loginEmail;
          onChange = (e) => selectedScreen?.name.toLowerCase().includes('signup') ? setSignupEmail(e.target.value) : setLoginEmail(e.target.value);
        } else if (isPassword) {
          val = selectedScreen?.name.toLowerCase().includes('signup') ? signupPassword : loginPassword;
          onChange = (e) => selectedScreen?.name.toLowerCase().includes('signup') ? setSignupPassword(e.target.value) : setLoginPassword(e.target.value);
        } else if (isName) {
          val = signupName;
          onChange = (e) => setSignupName(e.target.value);
        } else {
          val = '';
        }

        return (
          <div className="w-full h-full flex flex-col justify-center text-left" onMouseDown={e => e.stopPropagation()}>
            <span className="block text-[8px] font-extrabold text-slate-500 uppercase tracking-wide mb-0.5">{el.label || 'Input Field'}</span>
            <input
              type={isPassword ? 'password' : 'text'}
              placeholder={`Enter ${el.label || 'value'}...`}
              value={val}
              onChange={onChange}
              className={`w-full py-1 px-2.5 text-[9px] focus:outline-none focus:ring-1 focus:ring-violet-500/50 ${pt.input}`}
            />
            {formErrors.login && (isEmail || isPassword) && !selectedScreen?.name.toLowerCase().includes('signup') && (
              <span className="text-[7px] text-rose-500 mt-0.5 block truncate max-w-[200px]">{formErrors.login}</span>
            )}
            {formErrors.signup && (isEmail || isPassword || isName) && selectedScreen?.name.toLowerCase().includes('signup') && (
              <span className="text-[7px] text-rose-500 mt-0.5 block truncate max-w-[200px]">{formErrors.signup}</span>
            )}
          </div>
        );
      }
      case 'ProductGrid':
        return (
          <div className="grid grid-cols-2 gap-2 w-full h-full overflow-hidden">
            {[
              { id: 201, name: 'Pepperoni Supreme', price: 14.99, icon: '🍕' },
              { id: 202, name: 'Burger Combo Deal', price: 11.50, icon: '🍔' },
              { id: 203, name: 'Fries Bucket Extra', price: 4.99, icon: '🍟' },
              { id: 204, name: 'Cold Brew Latte', price: 3.50, icon: '☕' }
            ].slice(0, el.itemsCount || 2).map((item, i) => (
              <div 
                key={i} 
                onClick={(e) => {
                  e.stopPropagation();
                  setCartItems(prev => {
                    const existing = prev.find(c => c.id === item.id);
                    if (existing) {
                      return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
                    }
                    return [...prev, { ...item, quantity: 1 }];
                  });
                  triggerMockupToast(`🍕 Added ${item.name} to Cart`);
                }}
                className={`p-2 text-left h-full ${pt.card} flex flex-col justify-between hover:border-violet-500/40 cursor-pointer active:scale-95 transition-all`}
              >
                <div className="w-full h-8 bg-black/25 rounded-md flex items-center justify-center text-xs">{item.icon}</div>
                <div className="flex flex-col gap-0.2 mt-0.5">
                  <span className="text-[8px] font-black truncate block">{item.name}</span>
                  <span className="text-[7px] font-bold text-violet-400">${item.price}</span>
                </div>
              </div>
            ))}
          </div>
        );
      case 'CartList':
        return (
          <div className="flex flex-col gap-1.5 w-full h-full overflow-y-auto" onMouseDown={e => e.stopPropagation()}>
            {cartItems.length === 0 ? (
              <div className="text-center py-6 text-[9px] text-slate-500 italic">Your cart is empty.</div>
            ) : (
              cartItems.map((item, i) => (
                <div key={i} className={`flex items-center justify-between p-1.5 ${pt.card} text-[9px]`}>
                  <div className="flex flex-col truncate max-w-[120px] text-left">
                    <span className="font-extrabold truncate text-white">{item.name}</span>
                    <span className="text-[7px] text-slate-500">${item.price} x {item.quantity}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setCartItems(prev => prev.filter(c => c.id !== item.id));
                      triggerMockupToast('🗑️ Removed item');
                    }}
                    className="text-rose-400 hover:text-rose-300 font-black text-[10px] px-1 cursor-pointer transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        );
      case 'CardDetailsForm':
        return (
          <div className={`p-3 text-left w-full h-full ${pt.card} flex flex-col justify-between`} onMouseDown={e => e.stopPropagation()}>
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-bold text-slate-500 uppercase">Card Holder Name</span>
              <input type="text" placeholder="e.g. John Doe" className={`w-full py-1 px-2 text-[8px] ${pt.input}`} />
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-[8px] font-bold text-slate-500 uppercase">Card Number</span>
              <input type="text" placeholder="•••• •••• •••• ••••" className={`w-full py-1 px-2 text-[8px] ${pt.input}`} />
            </div>
          </div>
        );
      case 'ChatWidget':
        return (
          <div className="flex flex-col h-full w-full justify-between" onMouseDown={e => e.stopPropagation()}>
            <div className="flex-1 flex flex-col gap-1.5 p-1.5 overflow-y-auto text-[8px]">
              {chatMessagesHistory.map((m, i) => (
                <div 
                  key={i} 
                  className={`p-1.5 rounded-xl max-w-[85%] text-left ${
                    m.sender === 'user' 
                      ? 'bg-violet-600 text-white self-end rounded-tr-none' 
                      : 'bg-slate-700/25 text-slate-300 self-start rounded-tl-none border border-slate-800'
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <div className="flex gap-1 border-t border-slate-900 pt-1">
              <input 
                type="text" 
                placeholder="Ask support..." 
                value={chatInputText}
                onChange={e => setChatInputText(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && chatInputText.trim()) {
                    const typed = chatInputText.trim();
                    setChatInputText('');
                    setChatMessagesHistory(prev => [...prev, { sender: 'user', text: typed }]);
                    
                    setTimeout(() => {
                      setChatMessagesHistory(prev => [
                        ...prev, 
                        { sender: 'agent', text: `🤖 Support Agent: We've received your query "${typed}" and are looking into it right away.` }
                      ]);
                    }, 1000);
                  }
                }}
                className={`flex-1 text-[8px] bg-black/40 border border-slate-800 px-2 py-1 rounded-xl text-white focus:outline-none focus:border-violet-500`}
              />
            </div>
          </div>
        );
      case 'MapWidget':
        return (
          <div className={`w-full h-full relative overflow-hidden flex items-center justify-center ${pt.card}`}>
            <div className="absolute inset-0 bg-slate-950 bg-[radial-gradient(#4a4f6d_1px,transparent_1px)] [background-size:12px_12px] opacity-20" />
            <div className="absolute w-2.5 h-2.5 bg-blue-500 border-2 border-white rounded-full glow-pulse shadow-md" />
            <span className="absolute bottom-1 left-1 bg-slate-900/90 border border-slate-800 text-[7px] px-1 py-0.5 rounded text-slate-400 font-semibold">{el.center}</span>
          </div>
        );
      case 'Navbar':
        return (
          <div className={`w-full h-full flex justify-around items-center ${pt.navbar}`}>
            {[
              { i: '🏠', target: 'Home' },
              { i: '🔍', target: 'Support' },
              { i: '🛒', target: 'Cart' },
              { i: '⚙️', target: 'Settings' }
            ].map((nav, idx) => (
              <span 
                key={idx} 
                onClick={(e) => {
                  e.stopPropagation();
                  handleMockupNavigate(nav.target);
                }}
                className="text-xs cursor-pointer hover:scale-125 transition-transform"
              >
                {nav.i}
              </span>
            ))}
          </div>
        );
      case 'Toggle':
        return (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              const nextMode = project?.theme === 'Dark' ? 'Light' : 'Dark';
              await handleThemeChange(nextMode);
              
              // Propagate theme update back to master blueprint in SQLite!
              const bp = getBlueprint();
              if (bp) {
                if (!bp.theme) bp.theme = {} as any;
                bp.theme.mode = nextMode.toLowerCase() as any;
                await window.electronAPI.saveBlueprint(projectId, bp);
              }
              triggerMockupToast(`🎨 Theme set to ${nextMode}`);
            }}
            className="w-full h-full flex items-center justify-between p-2 rounded-xl bg-slate-900/50 border border-slate-850 text-left cursor-pointer"
          >
            <span className="text-[9px] font-bold text-slate-400">{el.label || 'Toggle'}</span>
            <div className="w-6 h-3 rounded-full bg-violet-600/40 relative">
              <div className={`w-2.5 h-2.5 rounded-full bg-white absolute top-0.2 transition-all ${
                project?.theme === 'Dark' ? 'right-0.5' : 'left-0.5'
              }`} />
            </div>
          </button>
        );
      case 'Calendar':
      case 'AppointmentCard':
        return (
          <div className={`p-2.5 text-left w-full h-full overflow-y-auto ${pt.card}`} onMouseDown={e => e.stopPropagation()}>
            <span className="text-[8px] font-black uppercase text-violet-400 block mb-1">📅 Appointments CRUD</span>
            <div className="flex flex-col gap-1 max-h-[50px] overflow-y-auto mb-1">
              {appointments.map(app => (
                <div key={app.id} className="flex justify-between items-center bg-black/35 p-1 rounded border border-slate-850 text-[7px]">
                  <div className="truncate max-w-[130px]">
                    <span className="font-bold text-white block">{app.doctor}</span>
                    <span className="text-slate-500">{app.date} • {app.time}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setAppointments(prev => prev.filter(a => a.id !== app.id));
                      triggerMockupToast('🗑️ Cancelled Appointment');
                    }}
                    className="text-red-400 hover:text-red-300 font-bold px-1"
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const docName = prompt("Enter Doctor Name:", "Dr. James Carter");
                if (docName) {
                  setAppointments(prev => [...prev, { id: Date.now(), doctor: docName, time: '11:00 AM', date: 'Tomorrow', status: 'CONFIRMED' }]);
                  triggerMockupToast('📅 Appointment Booked!');
                }
              }}
              className="w-full text-center py-0.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-[7px] rounded"
            >
              + Book New Slot
            </button>
          </div>
        );
      case 'NotificationCard':
        return (
          <div className={`p-2 text-left w-full h-full overflow-y-auto ${pt.card}`} onMouseDown={e => e.stopPropagation()}>
            <span className="text-[8px] font-black uppercase text-violet-400 block mb-1">🔔 Alerts</span>
            <div className="flex flex-col gap-1">
              {notifications.map(n => (
                <div 
                  key={n.id} 
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, is_read: true } : notif));
                    triggerMockupToast('📖 Marked Notification Read');
                  }}
                  className={`p-1 rounded text-[7px] flex items-start gap-1 cursor-pointer transition-colors ${
                    n.is_read ? 'bg-black/10 text-slate-500' : 'bg-violet-600/10 border border-violet-500/20 text-white font-bold'
                  }`}
                >
                  <span className="text-violet-400">•</span>
                  <div className="flex-1">
                    <span className="block">{n.title}</span>
                    <span className="text-[6px] text-slate-500 block leading-tight">{n.body}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Table':
      case 'DataGrid':
      case 'ListItem':
      case 'ListTile':
        return (
          <div className={`p-2 text-left w-full h-full overflow-y-auto ${pt.card}`} onMouseDown={e => e.stopPropagation()}>
            <span className="text-[8px] font-black uppercase text-violet-400 block mb-1">📊 Database Records CRUD</span>
            <div className="flex flex-col gap-1 max-h-[50px] overflow-y-auto mb-1">
              {itemsList.map(item => (
                <div key={item.id} className="flex justify-between items-center p-1 bg-black/20 rounded border border-slate-900 text-[7px]">
                  <div className="truncate max-w-[150px]">
                    <span className="font-bold text-white block">{item.title}</span>
                    <span className="text-slate-500 text-[6px] block truncate">{item.description}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemsList(prev => prev.filter(i => i.id !== item.id));
                      triggerMockupToast('🗑️ Deleted Record');
                    }}
                    className="text-red-400 hover:text-red-300 font-bold px-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-1 mt-1">
              <input 
                type="text" 
                placeholder="Add record name..." 
                value={newItemTitle}
                onChange={e => setNewItemTitle(e.target.value)}
                className="flex-1 text-[7px] bg-black/45 border border-slate-800 rounded px-1.5 py-0.5 text-white focus:outline-none focus:border-violet-500"
              />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (newItemTitle.trim()) {
                    setItemsList(prev => [...prev, { id: Date.now(), title: newItemTitle.trim(), description: 'User added record.' }]);
                    setNewItemTitle('');
                    triggerMockupToast('✅ Record Saved');
                  }
                }}
                className="bg-violet-600 hover:bg-violet-500 text-white text-[7px] font-bold px-2 rounded"
              >
                Add
              </button>
            </div>
          </div>
        );
      case 'Avatar':
      case 'Image':
        return (
          <div className="w-full h-full rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-[8px] overflow-hidden relative">
            <div className="absolute inset-0 bg-violet-600/5 hover:bg-violet-600/10 transition-colors" />
            <span className="font-black text-violet-400/80 uppercase tracking-widest">{el.type}</span>
          </div>
        );
      case 'Card':
        return (
          <div className={`w-full h-full p-2 text-left flex flex-col justify-between ${pt.card}`}>
            <span className="text-[9px] font-black text-white block leading-tight">{el.label || 'Widget Card'}</span>
            <span className="text-[7px] text-slate-500 block leading-relaxed mt-0.5">Prototype grid widget container.</span>
          </div>
        );
      case 'SearchBar':
        return (
          <div className="w-full h-full flex items-center px-2 bg-black/40 border border-slate-850 rounded-xl" onMouseDown={e => e.stopPropagation()}>
            <span className="text-[8px] mr-1 text-slate-500">🔍</span>
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-transparent text-[8px] text-slate-300 focus:outline-none placeholder:text-slate-650"
              onChange={(e) => {
                const query = e.target.value.toLowerCase();
                // Filter itemsList locally
                if (query) {
                  setItemsList(prev => prev.filter(i => i.title.toLowerCase().includes(query)));
                } else {
                  setItemsList([
                    { id: 1, title: 'Item Alpha', description: 'Primary inventory item.' },
                    { id: 2, title: 'Item Beta', description: 'Secondary backup stock.' }
                  ]);
                }
              }}
            />
          </div>
        );
      case 'Chart':
      case 'LineChart':
      case 'BarChart':
      case 'PieChart':
      case 'RadarChart':
      case 'FunnelChart':
      case 'ScatterPlot':
      case 'StockChart':
        return (
          <div className={`p-2 text-left w-full h-full flex flex-col justify-between ${pt.card}`}>
            <span className="text-[7px] font-black uppercase text-violet-400">📈 Analytics Chart</span>
            <div className="flex-1 flex items-end gap-1.5 justify-around mt-1">
              <div className="w-1.5 bg-gradient-to-t from-violet-600 to-indigo-500 rounded-full transition-all" style={{ height: '35%' }} />
              <div className="w-1.5 bg-gradient-to-t from-violet-600 to-indigo-500 rounded-full transition-all" style={{ height: '70%' }} />
              <div className="w-1.5 bg-gradient-to-t from-violet-600 to-indigo-500 rounded-full transition-all" style={{ height: '50%' }} />
              <div className="w-1.5 bg-gradient-to-t from-violet-600 to-indigo-500 rounded-full transition-all" style={{ height: '85%' }} />
            </div>
          </div>
        );
      case 'OTPInput':
      case 'OTPVerification':
      case 'MfaVerification':
        return (
          <div className="w-full h-full flex flex-col justify-between p-2" onMouseDown={e => e.stopPropagation()}>
            <span className="text-[7px] font-black uppercase text-violet-400 mb-1">🔐 Verification Check</span>
            <div className="flex gap-1.5 justify-center mb-1">
              {[1, 2, 3, 4].map(idx => (
                <input 
                  key={idx} 
                  type="text" 
                  maxLength={1} 
                  placeholder="•" 
                  className={`w-6 h-6 text-center text-xs font-black rounded-lg ${pt.input}`} 
                />
              ))}
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); triggerMockupToast('🔑 Code Verified!'); }}
              className="w-full py-0.5 bg-violet-600 text-white font-bold text-[7px] rounded-lg hover:bg-violet-500"
            >
              Verify Code
            </button>
          </div>
        );
      case 'Timeline':
      case 'TimelineItem':
        return (
          <div className={`p-2 text-left w-full h-full overflow-y-auto ${pt.card}`}>
            <span className="text-[7px] font-black uppercase text-violet-400 mb-1 block">📌 Milestone Timeline</span>
            <div className="flex flex-col gap-2 relative pl-2.5 border-l border-violet-500/30 text-[7px]">
              <div className="relative">
                <span className="absolute -left-3.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-white block">Step 1: Submitted</span>
                <span className="text-[6px] text-slate-500">Completed</span>
              </div>
              <div className="relative">
                <span className="absolute -left-3.5 w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                <span className="font-bold text-white block">Step 2: Processing</span>
                <span className="text-[6px] text-slate-500">In-progress</span>
              </div>
            </div>
          </div>
        );
      case 'VideoPlayer':
      case 'LiveStreamPlayer':
      case 'AudioPlayer':
        return (
          <div className={`p-2 text-left w-full h-full flex flex-col justify-between ${pt.card}`} onMouseDown={e => e.stopPropagation()}>
            <span className="text-[7px] font-black uppercase text-violet-400 font-extrabold">🎵 Media Player</span>
            <div className="flex items-center gap-2 my-1">
              <button 
                onClick={(e) => { e.stopPropagation(); triggerMockupToast('▶ Playing media stream...'); }}
                className="w-5 h-5 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center text-[8px] text-white"
              >
                ▶
              </button>
              <div className="flex-1 bg-black/45 h-1 rounded-full overflow-hidden">
                <div className="bg-violet-500 h-full" style={{ width: '40%' }} />
              </div>
            </div>
          </div>
        );
      case 'Camera':
      case 'VideoCamera':
      case 'QRScanner':
        return (
          <div className="w-full h-full relative border border-dashed border-violet-500/40 rounded-xl bg-black/40 flex items-center justify-center overflow-hidden" onMouseDown={e => e.stopPropagation()}>
            <div className="absolute inset-2 border border-violet-500/20 rounded flex items-center justify-center">
              <span className="text-[7px] uppercase tracking-widest text-violet-400 font-extrabold animate-pulse">📷 Scanner active</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); triggerMockupToast('📸 Image Captured Successfully'); }}
              className="absolute bottom-1 w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 border border-white/50"
            />
          </div>
        );
      case 'MarkdownView':
      case 'RichTextView':
        return (
          <div className={`p-2 text-left w-full h-full overflow-y-auto ${pt.card}`}>
            <span className="text-[7px] font-black uppercase text-violet-400 mb-1 block">📄 Document Reader</span>
            <h4 className="text-[8px] font-black text-white"># Terms & Agreements</h4>
            <p className="text-[6px] text-slate-500 leading-normal mt-0.5">Please read all agreements. This is standard formatted rich text preview container.</p>
          </div>
        );
      default:
        return <div className="p-2 border border-slate-850 text-slate-650 text-[8px] h-full flex items-center">Element: {el.type}</div>;
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden w-full bg-slate-950">
      {/* LEFT SIDEBAR PANEL: Screens & Reusable Components */}
      <div className="w-72 border-r border-slate-900 bg-slate-950/60 p-5 flex flex-col justify-between overflow-y-auto">
        <div className="flex flex-col gap-6">
          {/* Back Action */}
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
            Back to Dashboard
          </button>

          {/* Inline error toast */}
          {errorMsg && (
            <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-semibold flex items-center gap-2">
              <span>⚠</span> {errorMsg}
            </div>
          )}

          {/* SCREENS LIST */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Screens</span>
              <button
                onClick={() => setIsAddScreenOpen(true)}
                className="p-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-violet-500 transition-colors cursor-pointer"
                title="Create Screen"
              >
                <Plus size={13} />
              </button>
            </div>
            
            {screens.length === 0 ? (
              <p className="text-[11px] text-slate-600 italic">No screens generated yet.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {screens.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedScreen(s)}
                    className={`group flex justify-between items-center px-3.5 py-2.5 rounded-xl cursor-pointer transition-all border text-xs font-semibold ${
                      selectedScreen?.id === s.id
                        ? 'bg-violet-600/10 border-violet-500/35 text-white'
                        : 'bg-slate-950 border-transparent text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Layout size={13} className={selectedScreen?.id === s.id ? 'text-violet-400' : 'text-slate-500'} />
                      <span>{s.name}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteScreen(s.id);
                      }}
                      className="text-slate-600 hover:text-red-400 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* REUSABLE COMPONENTS LIST */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Components</span>
              <button
                onClick={() => setIsAddComponentOpen(true)}
                className="p-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-violet-500 transition-colors cursor-pointer"
                title="Create Reusable Component"
              >
                <Plus size={13} />
              </button>
            </div>

            {components.length === 0 ? (
              <p className="text-[11px] text-slate-600 italic">No components available.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {components.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-850/80 text-[10px] font-bold text-slate-300 hover:border-slate-700 transition-colors"
                  >
                    <span>{c.name} ({c.type})</span>
                    <button
                      onClick={() => handleDeleteComponent(c.id)}
                      className="text-slate-600 hover:text-red-400 cursor-pointer ml-1"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Settings metadata */}
        {project && (
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-850 text-left">
            <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold">
              <Cpu size={14} className="text-violet-400 animate-pulse" />
              <span>Engine Configuration</span>
            </div>
            <div className="flex flex-col gap-1 text-[10px] text-slate-500 font-mono">
              <div className="flex justify-between">
                <span>Database:</span>
                <span className="text-slate-400 font-bold uppercase">SQLite3</span>
              </div>
              <div className="flex justify-between">
                <span>Theme config:</span>
                <span className="text-slate-400 font-bold">{project.theme}</span>
              </div>
              <div className="flex justify-between">
                <span>App Blueprint:</span>
                <span className="text-slate-400 font-bold">
                  {blueprint ? 'Compiled' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CENTER PANEL: Canvas/Previews (Visual Mockup vs Blueprint Tab) */}
      <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
        {/* Workspace Toolbar */}
        <div className="p-4 border-b border-slate-900 bg-slate-950 flex items-center justify-between flex-wrap gap-4">
          <div className="flex rounded-xl bg-slate-900/60 border border-slate-850 p-1">
            <button
              onClick={() => setActiveTab('visual-builder')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                activeTab === 'visual-builder'
                  ? 'bg-violet-600 text-white shadow shadow-violet-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Visual Mockup Preview
            </button>
            <button
              onClick={() => setActiveTab('blueprint-inspector')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                activeTab === 'blueprint-inspector'
                  ? 'bg-violet-600 text-white shadow shadow-violet-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Blueprint Inspector
            </button>
            <button
              onClick={() => setActiveTab('project-metrics')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                activeTab === 'project-metrics'
                  ? 'bg-violet-600 text-white shadow shadow-violet-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Project Metrics
            </button>
          </div>

          {/* Theme Dropdown and Generate Button (Phase 3) */}
          <div className="flex items-center gap-4">
            {/* Undo / Redo controls */}
            {selectedScreen && (
              <div className="flex items-center rounded-xl bg-slate-900 border border-slate-850 p-1 mr-1">
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className={`p-1 rounded-lg transition-colors cursor-pointer ${
                    historyIndex > 0 ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 cursor-not-allowed'
                  }`}
                  title="Undo Layout"
                >
                  <RotateCcw size={13} className="transform scale-x-[-1]" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    historyIndex < history.length - 1 ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-650 cursor-not-allowed'
                  }`}
                  title="Redo Layout"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            )}

            {project && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Theme:</span>
                <select
                  value={project.theme}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  className="bg-slate-900 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="Dark">Dark Mode</option>
                  <option value="Light">Light Mode</option>
                  <option value="Material">Material Design</option>
                  <option value="Glass">Glassmorphic</option>
                </select>
              </div>
            )}

            <button
              onClick={() => setIsPreviewLandscape(!isPreviewLandscape)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-850 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Rotate Preview Device"
            >
              <Smartphone className={`transform transition-transform ${isPreviewLandscape ? 'rotate-90 text-violet-400' : ''}`} size={14} />
            </button>

            <button
              onClick={handleGenerateCode}
              disabled={!blueprint}
              className={`glow-button px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all text-white flex items-center gap-1.5 cursor-pointer ${
                blueprint 
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-500/10' 
                  : 'bg-slate-800 border border-slate-850 text-slate-500 cursor-not-allowed'
              }`}
              title={!blueprint ? "Interview required to generate code" : "Build runnable app"}
            >
              <Cpu size={14} />
              Generate Code App
            </button>

            <button
              onClick={handleBuildRelease}
              disabled={!blueprint || isBuildingRelease}
              className={`glow-button px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all text-white flex items-center gap-1.5 cursor-pointer ${
                blueprint 
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-md shadow-violet-500/10' 
                  : 'bg-slate-800 border border-slate-850 text-slate-500 cursor-not-allowed'
              }`}
              title={!blueprint ? "Interview required to build release" : "Compile release APK & source packaging"}
            >
              <Cpu size={14} />
              Build & Export Release APK
            </button>
          </div>
        </div>

        {/* WORKSPACE CONTENT AREA */}
        <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center relative">
          
          {/* TAB 1: VISUAL PHONE PREVIEW CANVAS */}
          {activeTab === 'visual-builder' && (
            <div className="flex flex-col items-center">
              {selectedScreen ? (
                <div 
                  className={`border-[8px] border-slate-900 rounded-[38px] shadow-2xl relative flex flex-col overflow-hidden ring-4 ring-slate-850/40 transition-all duration-300 ${pt.bg}`}
                  style={{
                    width: isPreviewLandscape ? '610px' : '310px',
                    height: isPreviewLandscape ? '340px' : '610px'
                  }}
                >
                  {/* Phone Status Notch */}
                  {!isPreviewLandscape && (
                    <div className="w-32 h-5 bg-slate-900 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl z-20 flex justify-center items-end pb-1">
                      <div className="w-1.5 h-1.5 bg-slate-800 rounded-full mr-2" />
                      <div className="w-6 h-1 bg-slate-800 rounded-full" />
                    </div>
                  )}

                  {/* Device Header Details */}
                  <div className={`p-4 ${isPreviewLandscape ? 'pt-4' : 'pt-6'} flex justify-between items-center text-[9px] font-mono text-slate-500 border-b ${pt.border}`}>
                    <span>9:41 AM</span>
                    <span className="font-extrabold">{selectedScreen.name} ({isPreviewLandscape ? 'Landscape' : 'Portrait'})</span>
                    <span>100% 🔋</span>
                  </div>

                  {/* Canvas Layout Render (Absolute Position Workspace Grid) */}
                  <div 
                    className="flex-1 relative overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px]"
                    onClick={() => setSelectedElementIndex(null)}
                  >
                    {isMockLoading && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-40 flex flex-col items-center justify-center gap-2">
                        <Cpu className="text-violet-500 animate-spin" size={24} />
                        <span className="text-[8px] font-black tracking-widest text-violet-400 uppercase font-mono">Simulating API Latency</span>
                      </div>
                    )}
                    {normElements.map((el: any, idx: number) => {
                      const isSelected = selectedElementIndex === idx;
                      return (
                        <div
                          key={idx}
                          style={{
                            position: 'absolute',
                            left: `${el.x}px`,
                            top: `${el.y}px`,
                            width: `${el.w}px`,
                            height: `${el.h}px`
                          }}
                          onMouseDown={(e) => handleElementMouseDown(e, idx)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedElementIndex(idx);
                          }}
                          className={`absolute select-none group transition-[border-color,box-shadow] duration-200 cursor-move ${
                            isSelected 
                              ? 'border-2 border-dashed border-violet-500 ring-2 ring-violet-500/10 z-20 bg-slate-900/40 backdrop-blur-[1px]' 
                              : 'border border-transparent hover:border-slate-800 hover:bg-slate-900/5'
                          }`}
                        >
                          {/* Render individual element content */}
                          {renderMockupElement(el, idx)}

                          {/* Interactive controls overlays */}
                          {isSelected && (
                            <>
                              {/* Resize corner handles */}
                              <div 
                                onMouseDown={(e) => handleResizeMouseDown(e, idx)}
                                className="absolute bottom-[-4px] right-[-4px] w-2.5 h-2.5 bg-violet-600 border border-white rounded-full cursor-se-resize z-30 shadow" 
                              />
                              
                              {/* Controls bar */}
                              <div className="absolute top-[-26px] right-0 flex items-center gap-1 bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded-lg shadow-lg z-30 text-[9px] font-bold">
                                <button
                                  onClick={(e) => handleDuplicateComponent(idx, e)}
                                  className="editor-control-btn text-slate-400 hover:text-white px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                                  title="Duplicate component"
                                >
                                  Clone
                                </button>
                                <div className="w-[1px] h-3 bg-slate-800" />
                                <button
                                  onClick={(e) => handleDeleteCanvasComponent(idx, e)}
                                  className="editor-control-btn text-rose-400 hover:text-rose-350 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                                  title="Delete component"
                                >
                                  Del
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                    {/* Simulated Prototype Toast Notifications */}
                    {toastMessage && (
                      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-violet-500/35 text-violet-300 px-3 py-1.5 rounded-full text-[9px] font-extrabold shadow-2xl z-[9999] flex items-center gap-1.5 animate-bounce">
                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-ping" />
                        {toastMessage}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <Smartphone size={40} className="text-slate-700 mx-auto mb-3" />
                  <p className="text-xs text-slate-500 font-semibold">No screen selected. Click a screen from left sidebar to design.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STEP 8 BLUEPRINT INSPECTOR */}
          {activeTab === 'blueprint-inspector' && (
            <div className="w-full max-w-2xl h-full flex flex-col gap-6">
              {!blueprint ? (
                <div className="text-center my-auto p-8 rounded-3xl bg-slate-900/30 border border-slate-850 border-dashed">
                  <Cpu size={32} className="text-slate-600 mx-auto mb-3 animate-pulse" />
                  <h4 className="text-sm font-bold text-slate-300">Blueprint Not Compiled</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                    Complete the AI Interview wizard in the chat panel to generate routes, APIs, schema files and configuration blueprints.
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-6 animate-slide-up">
                  {/* Title Info */}
                  <div className="flex items-center gap-2">
                    <Cpu className="text-violet-500" size={20} />
                    <h3 className="text-md font-bold text-white tracking-wide">Blueprint Specifications</h3>
                  </div>

                  {/* Blueprint visual navigation sub-tabs */}
                  <div className="flex gap-2 border-b border-slate-900 pb-3">
                    {[
                      { id: 'db', name: 'Database Tables', icon: Database },
                      { id: 'api', name: 'API Endpoints', icon: Key },
                      { id: 'routes', name: 'Routes & Nav', icon: Network }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isSubActive = activeBlueprintTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveBlueprintTab(tab.id as BlueprintTabType)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer border ${
                            isSubActive
                              ? 'bg-violet-600 border-violet-500 text-white shadow shadow-violet-500/10'
                              : 'bg-slate-900 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          <Icon size={12} />
                          {tab.name}
                        </button>
                      );
                    })}
                  </div>

                  {/* SUB-CONTENT RENDERERS */}
                  <div className="flex-1 bg-slate-900/40 border border-slate-850 p-5 rounded-2xl overflow-y-auto">
                    
                    {/* Database schemas view */}
                    {activeBlueprintTab === 'db' && (
                      <div className="flex flex-col gap-4">
                        {blueprint.database?.tables?.map((table: any, idx: number) => (
                          <div key={idx} className="bg-slate-950 p-4 border border-slate-850 rounded-xl">
                            <h4 className="text-xs font-extrabold text-violet-400 font-mono mb-2 flex items-center gap-2">
                              <span>📁 Table:</span> {table.name}
                            </h4>
                            <div className="grid grid-cols-2 gap-2 mt-2 pl-4 border-l border-violet-500/20">
                              {table.columns?.map((col: string, cIdx: number) => (
                                <span key={cIdx} className="text-[10px] text-slate-500 font-mono">{col}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* API Endpoints View */}
                    {activeBlueprintTab === 'api' && (
                      <div className="flex flex-col gap-3">
                        {blueprint.api?.endpoints?.map((ep: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between bg-slate-950 p-3 border border-slate-850 rounded-xl">
                            <div className="flex items-center gap-3">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                ep.method === 'GET' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                              }`}>
                                {ep.method}
                              </span>
                              <span className="text-xs font-bold text-slate-200 font-mono">{ep.path}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium italic">{ep.description}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Navigation Flow view */}
                    {activeBlueprintTab === 'routes' && (
                      <div className="flex flex-col gap-3">
                        {blueprint.navigation?.routes?.map((route: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 bg-slate-950 p-3.5 border border-slate-850 rounded-xl">
                            <div className="flex items-center gap-2 font-mono text-xs">
                              <span className="text-slate-400 font-semibold">Route:</span>
                              <span className="text-violet-400 font-bold">{route.path}</span>
                            </div>
                            <ArrowRight size={12} className="text-slate-600" />
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                              <Layout size={12} className="text-slate-500" />
                              <span>Screen:</span>
                              <span className="text-white">{route.screen}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'project-metrics' && (
            <div className="w-full max-w-2xl h-full flex flex-col gap-6">
              {!blueprint ? (
                <div className="text-center my-auto p-8 rounded-3xl bg-slate-900/30 border border-slate-850 border-dashed">
                  <Cpu size={32} className="text-slate-600 mx-auto mb-3 animate-pulse" />
                  <h4 className="text-sm font-bold text-slate-300">Metrics Unavailable</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                    Compile the AI Blueprint first to enable performance and validation checklists monitoring metrics.
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-6 animate-slide-up">
                  <div className="flex items-center gap-2">
                    <Cpu className="text-violet-500" size={20} />
                    <h3 className="text-md font-bold text-white tracking-wide">Project Analytics & Metrics</h3>
                  </div>

                  {(() => {
                    const manager = new AnalyticsManager();
                    const metrics = manager.calculateMetrics(blueprint);
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="col-span-2 md:col-span-3 bg-slate-900/60 p-5 rounded-2xl border border-violet-500/20 flex items-center justify-between shadow-lg">
                          <div>
                            <span className="text-slate-400 text-xs font-semibold">Overall Project Health</span>
                            <h4 className="text-3xl font-black text-emerald-400 mt-1">{metrics.overallHealth}%</h4>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 text-xs font-semibold">Estimated Build Success</span>
                            <h4 className="text-3xl font-black text-violet-400 mt-1">{metrics.estimatedBuildSuccess}%</h4>
                          </div>
                        </div>
                        
                        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-850 flex flex-col gap-2 shadow">
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Requirement Completeness</span>
                          <span className="text-2xl font-black text-blue-400">{metrics.requirementCompleteness}%</span>
                        </div>
                        
                        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-850 flex flex-col gap-2 shadow">
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Blueprint Score</span>
                          <span className="text-2xl font-black text-fuchsia-400">{metrics.blueprintScore}%</span>
                        </div>
                        
                        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-850 flex flex-col gap-2 shadow">
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">UI Coverage</span>
                          <span className="text-2xl font-black text-cyan-400">{metrics.uiCoverage}%</span>
                        </div>
                        
                        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-850 flex flex-col gap-2 shadow">
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Backend Coverage</span>
                          <span className="text-2xl font-black text-emerald-400">{metrics.backendCoverage}%</span>
                        </div>
                        
                        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-850 flex flex-col gap-2 shadow">
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Database Coverage</span>
                          <span className="text-2xl font-black text-amber-400">{metrics.databaseCoverage}%</span>
                        </div>

                        {metrics.warnings.length > 0 ? (
                          <div className="col-span-2 md:col-span-3 bg-slate-950 p-5 border border-rose-500/25 rounded-2xl mt-4 shadow-lg flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-black uppercase tracking-wider text-rose-400">🚨 Blueprint Validation Checks ({metrics.warnings.length} issues)</h4>
                              <span className="text-[9px] font-black text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">Missing Modules detected</span>
                            </div>
                            <div className="flex flex-col gap-2 mt-1">
                              {metrics.warnings.map((warn, i) => (
                                <div key={i} className="flex gap-2.5 items-start p-2.5 rounded-xl bg-slate-900 border border-slate-850">
                                  <span className="text-[10px] mt-0.5">⚠️</span>
                                  <div className="flex-1 text-left">
                                    <span className="text-[11px] font-semibold text-slate-300 block leading-normal">{warn}</span>
                                    <span className="text-[9px] text-slate-500">Requires AI compiler adjustments or manual canvas setup.</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="col-span-2 md:col-span-3 bg-slate-950 p-5 border border-emerald-500/25 rounded-2xl mt-4 shadow-lg flex flex-col items-center gap-1">
                            <span className="text-emerald-400 text-lg">🛡️</span>
                            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">Blueprint fully compliant</h4>
                            <p className="text-[10px] text-slate-500">No missing modules or industry warnings detected. High confidence rating.</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR PANEL: AI ASSISTANT CHAT */}
      <AIChatWindow 
        projectId={projectId} 
        activeScreen={selectedScreen}
        onSelectScreen={setSelectedScreen}
        onReloadWorkspace={loadWorkspaceData}
        onBlueprintBuilt={loadWorkspaceData} 
      />

      {/* --- ADD SCREEN DIALOG MODAL --- */}
      {isAddScreenOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-sm p-5 rounded-3xl border border-slate-800 shadow-2xl">
            <h4 className="text-md font-bold text-white mb-1.5">Add Screen</h4>
            <p className="text-[11px] text-slate-500 mb-4">Introduce a layout canvas wireframe to map in the application routes.</p>
            <form onSubmit={handleAddScreen} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="e.g. ProfileScreen, MainPanel"
                value={newScreenName}
                onChange={(e) => setNewScreenName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500 transition-colors"
                required
              />
              <div className="flex justify-end gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddScreenOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-850 text-slate-500 hover:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD REUSABLE COMPONENT DIALOG MODAL --- */}
      {isAddComponentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-sm p-5 rounded-3xl border border-slate-800 shadow-2xl">
            <h4 className="text-md font-bold text-white mb-1.5">Add Reusable Component</h4>
            <p className="text-[11px] text-slate-500 mb-4">Register a widget configuration to implement in the layouts.</p>
            <form onSubmit={handleAddComponent} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="e.g. SaveButton, CustomSwitch"
                value={newCompName}
                onChange={(e) => setNewCompName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500 transition-colors"
                required
              />
              <select
                value={newCompType}
                onChange={(e) => setNewCompType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-3.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500 transition-colors"
              >
                {['Button', 'Input', 'Container', 'Header', 'Toggle', 'CardGrid'].map(t => (
                  <option key={t} value={t}>{t} Component</option>
                ))}
              </select>
              <div className="flex justify-end gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddComponentOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-850 text-slate-500 hover:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Create Component
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- GENERATION PROGRESS LOADING OVERLAY (Phase 3) --- */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col gap-5 text-center">
            <Cpu className="text-violet-500 mx-auto animate-spin" size={36} />
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Generating Source Files</h4>
              <p className="text-[11px] text-slate-500">Compiling blueprints to React TypeScript web files.</p>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-850">
              <div 
                className="bg-gradient-to-r from-violet-600 to-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${genProgress}%` }}
              />
            </div>
            
            {/* Logs console */}
            <div className="bg-slate-950 p-4 border border-slate-900 rounded-2xl h-44 overflow-y-auto text-left font-mono text-[9px] text-slate-400 flex flex-col gap-1.5 scrollbar-thin">
              {generationLog.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-violet-500">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- GENERATION SUCCESS DETAILS MODAL (Phase 3) --- */}
      {isGenModalOpen && project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col gap-5">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">🎉 React Code Base Built!</h3>
              <p className="text-xs text-slate-500">
                A fully runnable React + Tailwind CSS web application has been generated for <span className="text-white font-semibold">"{project.name}"</span>.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Generated Files:</span>
              <div className="bg-slate-950 p-4 border border-slate-900 rounded-2xl max-h-56 overflow-y-auto font-mono text-[10px] text-slate-400 flex flex-col gap-2">
                {filesGenerated.map((f, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-slate-900/60 pb-1.5 last:border-b-0">
                    <span className="text-violet-400">{f}</span>
                    <span className="text-[8px] bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded text-slate-500 uppercase">Written</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-900/50 border border-slate-850 rounded-2xl flex flex-col gap-2 text-xs">
              <span className="font-bold text-slate-300">Run App Instructions:</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Open a terminal in the generated project folder at:
                <code className="block bg-slate-950 p-2.5 rounded-lg border border-slate-850 font-mono text-[9px] text-slate-400 mt-2 select-all select-text">
                  AppForge-AI/projects/{project.name}/
                </code>
                Install dependencies and boot up the development server:
                <code className="block bg-slate-950 p-2.5 rounded-lg border border-slate-850 font-mono text-[9px] text-violet-400 mt-2 select-all select-text">
                  npm install && npm run dev
                </code>
              </p>
            </div>

            <div className="flex justify-end mt-2">
              <button
                onClick={() => setIsGenModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-violet-500/10 transition-colors"
              >
                Close Logs & Back to Canvas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- BUILD AND EXPORT SYSTEM PROGRESS MODAL (Phase 10) --- */}
      {isBuildModalOpen && project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col gap-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">🛠️ AppForge Release Build Pipeline</h3>
                <p className="text-xs text-slate-500">Compiling Android platform containers, Spring Boot backends and SQLite DB files.</p>
              </div>
              {isBuildingRelease && (
                <div className="flex items-center gap-2 text-violet-400 font-mono text-[10px] font-bold uppercase tracking-widest bg-violet-950/40 border border-violet-900/40 px-2.5 py-1 rounded-lg">
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-ping" />
                  Building
                </div>
              )}
            </div>

            {/* Build Logs Terminal Console */}
            <div className="bg-slate-950 p-4 border border-slate-900 rounded-2xl h-56 overflow-y-auto text-left font-mono text-[9px] text-slate-400 flex flex-col gap-1.5 scrollbar-thin animate-pulse-subtle">
              {buildLog.map((log, idx) => {
                let colorClass = 'text-slate-400';
                if (log.startsWith('[Error]')) colorClass = 'text-rose-400 font-bold';
                else if (log.startsWith('[Test]')) colorClass = 'text-cyan-400';
                else if (log.startsWith('[Export]')) colorClass = 'text-emerald-400 font-bold';
                
                return (
                  <div key={idx} className={`flex gap-2 ${colorClass}`}>
                    <span className="text-slate-700">&gt;</span>
                    <span>{log}</span>
                  </div>
                );
              })}
            </div>

            {/* Success Build results linkages */}
            {buildResult && buildResult.success && (
              <div className="p-4 bg-slate-900/50 border border-slate-850 rounded-2xl flex flex-col gap-3 text-xs text-left">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  🎉 Build Completed Successfully!
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  The compiled visual files, Java sources, database files, and Deploy guides have been successfully packaged!
                </p>
                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex items-center justify-between bg-slate-950 p-2.5 border border-slate-850 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Export Directory</span>
                    <code className="text-[9px] text-violet-400 select-all select-text truncate max-w-[280px]">
                      AppForge-AI/projects/{project.name}/export/
                    </code>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 pl-1">
                    <span>Includes: app.apk, {project.name}-Export-Package.zip</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-1">
              {buildResult && (
                <button
                  onClick={() => {
                    setIsBuildModalOpen(false);
                    setBuildResult(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-violet-500/10 transition-colors"
                >
                  Return to Workspace
                </button>
              )}
              {!buildResult && !isBuildingRelease && (
                <button
                  onClick={() => setIsBuildModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-850 text-slate-500 hover:text-slate-350 text-xs font-semibold cursor-pointer"
                >
                  Close Console
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

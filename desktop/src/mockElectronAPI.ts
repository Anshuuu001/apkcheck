import { generateReactNativeProject } from './generator/react-native/appGenerator';
import { generateSpringBootProject } from './generator/springboot/appGenerator';

const PROJECTS_KEY = 'appforge_mock_projects';
const SCREENS_KEY = 'appforge_mock_screens';
const COMPONENTS_KEY = 'appforge_mock_components';
const CHAT_KEY = 'appforge_mock_chat';

const getLocalStorage = (key: string, fallback: any) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
};

export const setupMockElectronAPI = () => {
  if (typeof window === 'undefined' || window.electronAPI) {
    return;
  }

  console.warn('⚠️ Electron API not found. Running in browser simulation mode (using LocalStorage for persistence).');

  let logCallbacks: ((data: { projectId: number; message: string }) => void)[] = [];

  const mockAPI: any = {
    getProjects: async () => {
      return getLocalStorage(PROJECTS_KEY, []);
    },

    createProject: async (name: string, theme = 'Dark') => {
      const projects = getLocalStorage(PROJECTS_KEY, []);
      const newProj = {
        id: Date.now(),
        name,
        theme,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        settings: JSON.stringify({ theme, version: '1.0.0', features: { login: false, payment: false, chat: false, gps: false } }),
        blueprint: JSON.stringify({ name, screens: [], components: [], database: { tables: [] }, api: { endpoints: [] }, navigation: { routes: [] } })
      };
      projects.push(newProj);
      setLocalStorage(PROJECTS_KEY, projects);
      return newProj;
    },

    renameProject: async (id: number, newName: string) => {
      const projects = getLocalStorage(PROJECTS_KEY, []);
      const pIndex = projects.findIndex((p: any) => p.id === id);
      if (pIndex !== -1) {
        projects[pIndex].name = newName;
        projects[pIndex].updated_at = new Date().toISOString();
        setLocalStorage(PROJECTS_KEY, projects);
      }
      return { success: true };
    },

    deleteProject: async (id: number) => {
      const projects = getLocalStorage(PROJECTS_KEY, []);
      const filtered = projects.filter((p: any) => p.id !== id);
      setLocalStorage(PROJECTS_KEY, filtered);

      // Clean screens, components, chat
      const screens = getLocalStorage(SCREENS_KEY, []);
      setLocalStorage(SCREENS_KEY, screens.filter((s: any) => s.project_id !== id));

      const components = getLocalStorage(COMPONENTS_KEY, []);
      setLocalStorage(COMPONENTS_KEY, components.filter((c: any) => c.project_id !== id));

      const chat = getLocalStorage(CHAT_KEY, []);
      setLocalStorage(CHAT_KEY, chat.filter((m: any) => m.project_id !== id));

      return { success: true };
    },

    getProjectDetails: async (id: number) => {
      const projects = getLocalStorage(PROJECTS_KEY, []);
      const project = projects.find((p: any) => p.id === id) || null;

      const screens = getLocalStorage(SCREENS_KEY, []).filter((s: any) => s.project_id === id);
      const components = getLocalStorage(COMPONENTS_KEY, []).filter((c: any) => c.project_id === id);
      const chatHistory = getLocalStorage(CHAT_KEY, []).filter((m: any) => m.project_id === id);

      return { project, screens, components, chatHistory };
    },

    saveSettings: async (projectId: number, settings: any) => {
      const projects = getLocalStorage(PROJECTS_KEY, []);
      const pIndex = projects.findIndex((p: any) => p.id === projectId);
      if (pIndex !== -1) {
        projects[pIndex].settings = JSON.stringify(settings);
        projects[pIndex].theme = settings.theme || projects[pIndex].theme;
        projects[pIndex].updated_at = new Date().toISOString();
        setLocalStorage(PROJECTS_KEY, projects);
      }
      return { success: true };
    },

    saveBlueprint: async (projectId: number, blueprint: any) => {
      const projects = getLocalStorage(PROJECTS_KEY, []);
      const pIndex = projects.findIndex((p: any) => p.id === projectId);
      if (pIndex !== -1) {
        projects[pIndex].blueprint = JSON.stringify(blueprint);
        projects[pIndex].updated_at = new Date().toISOString();
        setLocalStorage(PROJECTS_KEY, projects);
      }
      return { success: true };
    },

    syncProject: async () => {
      return { success: true };
    },

    createScreen: async (projectId: number, name: string, layoutData: string) => {
      const screens = getLocalStorage(SCREENS_KEY, []);
      const newScreen = {
        id: Date.now(),
        project_id: projectId,
        name,
        layout_data: layoutData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      screens.push(newScreen);
      setLocalStorage(SCREENS_KEY, screens);
      return newScreen;
    },

    updateScreen: async (id: number, name: string, layoutData: string) => {
      const screens = getLocalStorage(SCREENS_KEY, []);
      const sIndex = screens.findIndex((s: any) => s.id === id);
      if (sIndex !== -1) {
        screens[sIndex].name = name;
        screens[sIndex].layout_data = layoutData;
        screens[sIndex].updated_at = new Date().toISOString();
        setLocalStorage(SCREENS_KEY, screens);
      }
      return { success: true };
    },

    deleteScreen: async (id: number) => {
      const screens = getLocalStorage(SCREENS_KEY, []);
      const filtered = screens.filter((s: any) => s.id !== id);
      setLocalStorage(SCREENS_KEY, filtered);
      return { success: true };
    },

    createComponent: async (projectId: number, name: string, type: string, configData: string) => {
      const components = getLocalStorage(COMPONENTS_KEY, []);
      const newComp = {
        id: Date.now(),
        project_id: projectId,
        name,
        type,
        config_data: configData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      components.push(newComp);
      setLocalStorage(COMPONENTS_KEY, components);
      return newComp;
    },

    updateComponent: async (id: number, name: string, type: string, configData: string) => {
      const components = getLocalStorage(COMPONENTS_KEY, []);
      const cIndex = components.findIndex((c: any) => c.id === id);
      if (cIndex !== -1) {
        components[cIndex].name = name;
        components[cIndex].type = type;
        components[cIndex].config_data = configData;
        components[cIndex].updated_at = new Date().toISOString();
        setLocalStorage(COMPONENTS_KEY, components);
      }
      return { success: true };
    },

    deleteComponent: async (id: number) => {
      const components = getLocalStorage(COMPONENTS_KEY, []);
      const filtered = components.filter((c: any) => c.id !== id);
      setLocalStorage(COMPONENTS_KEY, filtered);
      return { success: true };
    },

    getChatHistory: async (projectId: number) => {
      return getLocalStorage(CHAT_KEY, []).filter((m: any) => m.project_id === projectId);
    },

    addChatMessage: async (projectId: number, role: 'user' | 'assistant', content: string, imagePath?: string) => {
      const chat = getLocalStorage(CHAT_KEY, []);
      const newMsg = {
        id: Date.now(),
        project_id: projectId,
        role,
        content,
        image_path: imagePath || null,
        created_at: new Date().toISOString()
      };
      chat.push(newMsg);
      setLocalStorage(CHAT_KEY, chat);
      return newMsg;
    },

    clearChatHistory: async (projectId: number) => {
      const chat = getLocalStorage(CHAT_KEY, []);
      const filtered = chat.filter((m: any) => m.project_id !== projectId);
      setLocalStorage(CHAT_KEY, filtered);
      return { success: true };
    },

    analyzeProjectIntent: async (message: string) => {
      const msg = message.toLowerCase();
      let domain = 'Custom Portal App';
      let theme: 'Dark' | 'Light' | 'Glassmorphic' = 'Dark';
      let features = ['User Authorization', 'Dashboard', 'Settings', 'Database Sync'];
      let users = ['User', 'Admin'];
      let businessLogic = ['User registers', 'User accesses dashboard settings'];
      let databaseTables = [
        { name: 'users', columns: ['id (Int, PK)', 'email (Text)', 'password_hash (Text)'] }
      ];
      let apiEndpoints: Array<{ method: 'GET' | 'POST' | 'PUT' | 'DELETE'; path: string; description: string }> = [
        { method: 'POST', path: '/api/auth/register', description: 'Register account' },
        { method: 'POST', path: '/api/auth/login', description: 'Login user' }
      ];

      if (msg.includes('food') || msg.includes('delivery')) {
        domain = 'Food Delivery App';
        features = ['Wishlist', 'Coupons', 'Wallet', 'Live Tracking', 'Reviews', 'Rating'];
        users = ['Customer', 'Driver', 'Restaurant Admin'];
        businessLogic = ['Customer places order', 'Restaurant accepts & prepares', 'Driver accepts & delivers'];
        databaseTables = [
          { name: 'users', columns: ['id (Int, PK)', 'email (Text)', 'role (Text)'] },
          { name: 'orders', columns: ['id (Int, PK)', 'user_id (Int, FK)', 'amount (Float)', 'status (Text)'] },
          { name: 'coordinates', columns: ['id (Int, PK)', 'order_id (Int, FK)', 'latitude (Float)', 'longitude (Float)'] }
        ];
        apiEndpoints = [
          { method: 'POST', path: '/api/orders/place', description: 'Submit new food order' },
          { method: 'GET', path: '/api/delivery/track/:orderId', description: 'Get live coordinates' }
        ];
      } else if (msg.includes('taxi') || msg.includes('uber')) {
        domain = 'Taxi App / Ride-sharing';
        theme = 'Glassmorphic';
        features = ['Book Ride', 'Driver Matching', 'In-app Wallet', 'Live Location', 'Ride History'];
        users = ['Passenger', 'Driver'];
        businessLogic = ['Passenger requests trip', 'Driver accepts', 'Ride tracks coordinates', 'Ride completes'];
        databaseTables = [
          { name: 'users', columns: ['id (Int, PK)', 'email (Text)', 'role (Text)'] },
          { name: 'rides', columns: ['id (Int, PK)', 'passenger_id (Int, FK)', 'driver_id (Int, FK)', 'status (Text)'] },
          { name: 'coordinates', columns: ['id (Int, PK)', 'ride_id (Int, FK)', 'latitude (Float)', 'longitude (Float)'] }
        ];
        apiEndpoints = [
          { method: 'POST', path: '/api/rides/request', description: 'Request ride matchmaking' },
          { method: 'POST', path: '/api/location/ping', description: 'Submit coord pings' }
        ];
      } else if (msg.includes('shop') || msg.includes('commerce') || msg.includes('store')) {
        domain = 'E-Commerce Storefront';
        features = ['Wishlist', 'Coupons', 'Shopping Cart', 'Stripe checkout'];
        users = ['Buyer', 'Seller'];
        businessLogic = ['Buyer browse products', 'Buyer pays via card checkout', 'Seller updates shipment'];
        databaseTables = [
          { name: 'users', columns: ['id (Int, PK)', 'email (Text)'] },
          { name: 'products', columns: ['id (Int, PK)', 'name (Text)', 'price (Float)'] },
          { name: 'orders', columns: ['id (Int, PK)', 'total (Float)', 'status (Text)'] }
        ];
        apiEndpoints = [
          { method: 'POST', path: '/api/checkout/pay', description: 'Process payment session' }
        ];
      }

      return { domain, theme, features, users, businessLogic, databaseTables, apiEndpoints };
    },

    validateProjectRequirements: async (projectId: number) => {
      // Mock validation alerts
      const projects = getLocalStorage(PROJECTS_KEY, []);
      const p = projects.find((x: any) => x.id === projectId);
      const warnings: any[] = [];
      if (p && p.blueprint) {
        const bp = JSON.parse(p.blueprint);
        const tables = (bp.database?.tables || []).map((t: any) => t.name.toLowerCase());
        const screens = (bp.screens || []).map((s: any) => s.name.toLowerCase());
        if (screens.includes('loginscreen') && !tables.includes('users')) {
          warnings.push({
            severity: 'error',
            category: 'Authentication',
            message: 'Warning: Login screen is active, but missing "users" database table.'
          });
        }
      }
      return warnings;
    },

    buildBlueprint: async (projectId: number, schema: any) => {
      const screens: any[] = [];
      
      const names = ['WelcomeScreen', 'HomeScreen', 'SettingsScreen'];
      if (schema.features?.includes('Wishlist') || schema.features?.includes('Cart') || schema.features?.includes('Shopping Cart')) {
        names.push('CartScreen');
      }
      if (schema.features?.includes('Live Location') || schema.features?.includes('Live Tracking')) {
        names.push('TrackingScreen');
      }
      if (schema.features?.includes('Coupons')) {
        names.push('PromoScreen');
      }

      names.forEach((name, idx) => {
        screens.push({
          id: Date.now() + idx,
          project_id: projectId,
          name,
          layout_data: JSON.stringify({ elements: [{ type: 'Heading', content: name }] })
        });
      });

      setLocalStorage(SCREENS_KEY, [...getLocalStorage(SCREENS_KEY, []).filter((s: any) => s.project_id !== projectId), ...screens]);

      const blueprint = {
        name: schema.domain || 'Dynamic App',
        features: schema.features || [],
        screens: screens.map(s => ({ id: s.id, name: s.name, layout: JSON.parse(s.layout_data) })),
        components: [],
        database: { tables: schema.databaseTables || [] },
        api: { endpoints: schema.apiEndpoints || [] },
        navigation: { routes: screens.map(s => ({ path: `/${s.name.toLowerCase()}`, screen: s.name })) }
      };

      const projects = getLocalStorage(PROJECTS_KEY, []);
      const pIndex = projects.findIndex((p: any) => p.id === projectId);
      if (pIndex !== -1) {
        projects[pIndex].blueprint = JSON.stringify(blueprint);
        projects[pIndex].theme = schema.theme || projects[pIndex].theme;
        setLocalStorage(PROJECTS_KEY, projects);
      }

      return { success: true, blueprint };
    },

    generateCodeAssets: async (projectId: number) => {
      const projects = getLocalStorage(PROJECTS_KEY, []);
      const project = projects.find((p: any) => p.id === projectId);
      if (!project || !project.blueprint) {
        return { success: false, filesGenerated: [] };
      }

      try {
        const blueprint = JSON.parse(project.blueprint);
        const rnFiles = generateReactNativeProject(blueprint);
        const sbFiles = generateSpringBootProject(blueprint);

        const filesGenerated = [
          ...rnFiles.map(f => `frontend-rn/${f.path}`),
          ...sbFiles.map(f => `backend-sb/${f.path}`)
        ];

        return { success: true, filesGenerated };
      } catch (e) {
        console.error('Error generating assets:', e);
        return { success: false, filesGenerated: [] };
      }
    },

    buildRelease: async (projectId: number) => {
      const emitLog = (msg: string) => {
        logCallbacks.forEach(cb => cb({ projectId, message: msg }));
      };

      setTimeout(() => emitLog('[Build] Starting browser-simulation release build...'), 200);
      setTimeout(() => emitLog('[Build] Resolving npm packages...'), 600);
      setTimeout(() => emitLog('[Build] Compiling React static production elements...'), 1200);
      setTimeout(() => emitLog('[Build] Packaging Android hybrid wrapper...'), 1800);
      setTimeout(() => emitLog('[Test] Spawning browser mock emulation tests...'), 2400);
      setTimeout(() => emitLog('[Test] Emulator Pixel_6_API_31 loaded successfully.'), 3000);
      setTimeout(() => emitLog('[Export] Assembling files: app.apk, source-code.zip, docs/DEPLOYMENT.md...'), 3600);
      setTimeout(() => emitLog('[Export] Release packages built successfully in browser sandbox!'), 4200);

      await new Promise(r => setTimeout(r, 4500));

      return {
        success: true,
        apkPath: 'browser-sandbox/app.apk',
        zipPath: 'browser-sandbox/export.zip',
        exportDir: 'browser-sandbox/'
      };
    },

    onBuildLog: (callback: any) => {
      logCallbacks.push(callback);
    },

    removeBuildLogListener: () => {
      logCallbacks = [];
    },

    // ── New Blueprint Engine API (Phase 2 upgrade) ─────────────────────────

    updateBlueprint: async (projectId: number, blueprintJson: string) => {
      const projects = getLocalStorage(PROJECTS_KEY, []);
      const pIndex = projects.findIndex((p: any) => p.id === projectId);
      if (pIndex !== -1) {
        projects[pIndex].blueprint = blueprintJson;
        projects[pIndex].updated_at = new Date().toISOString();
        setLocalStorage(PROJECTS_KEY, projects);
      }
      return { success: true };
    },

    getBlueprint: async (projectId: number) => {
      const projects = getLocalStorage(PROJECTS_KEY, []);
      const project = projects.find((p: any) => p.id === projectId);
      return project?.blueprint ? JSON.parse(project.blueprint) : null;
    },

    /**
     * Mock AI call — in production Electron, this calls the Spring Boot /ai/generate endpoint
     * which proxies to Gemini Flash. In browser mode, returns null so engines fall back to
     * their local (deterministic) generators.
     */
    callAI: async (_prompt: string): Promise<string | null> => {
      // In browser simulation, return null so local generators are used
      console.info('[MockAPI] callAI: returning null (no AI in browser mode). Local generator will be used.');
      return null;
    },

    syncProject: async () => {
      return { success: true };
    },
  };

  (window as any).electronAPI = mockAPI;
};

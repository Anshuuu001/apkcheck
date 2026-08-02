import path from 'path';
import fs from 'fs';
import { IDatabase, Project } from './database';

export class ProjectManager {
  private projectsDir: string;
  private db: IDatabase;

  constructor(projectsDir: string, db: IDatabase) {
    this.projectsDir = projectsDir;
    this.db = db;

    // Ensure projects folder exists
    if (!fs.existsSync(projectsDir)) {
      fs.mkdirSync(projectsDir, { recursive: true });
    }
  }

  // Helper to remove directory recursively (compat utility)
  private deleteFolderRecursive(folderPath: string) {
    if (fs.existsSync(folderPath)) {
      fs.readdirSync(folderPath).forEach((file: string) => {
        const curPath = path.join(folderPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          // recurse
          this.deleteFolderRecursive(curPath);
        } else {
          // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(folderPath);
    }
  }

  // Create a new project locally
  createProject(name: string, theme: string = 'Dark'): Project {
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error('Project name cannot be empty');

    // Check database
    const existing = this.db.getProjectByName(trimmedName);
    if (existing) {
      throw new Error(`A project named "${trimmedName}" already exists`);
    }

    // Check directory
    const projectPath = path.join(this.projectsDir, trimmedName);
    if (fs.existsSync(projectPath)) {
      throw new Error(`Directory folders for "${trimmedName}" already exist on disk`);
    }

    // Create folders
    fs.mkdirSync(projectPath, { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'assets'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });

    // Initial default configuration
    const settingsObj = {
      theme: theme,
      version: '1.0.0',
      features: {
        login: false,
        payment: false,
        chat: false,
        gps: false
      }
    };

    const blueprintObj = {
      name: trimmedName,
      screens: [],
      components: [],
      database: { tables: [] },
      api: { endpoints: [] },
      navigation: { routes: [] }
    };

    const settingsStr = JSON.stringify(settingsObj);
    const blueprintStr = JSON.stringify(blueprintObj);

    // Save to Database
    const project = this.db.createProject(trimmedName, theme, settingsStr, blueprintStr);

    // Write project.json file (Step 7 Requirement)
    this.writeProjectJson(trimmedName, project, [], [], settingsObj, blueprintObj);

    return project;
  }

  // Write the project.json config file to local project folder
  private writeProjectJson(
    projectName: string,
    project: Project,
    screens: any[] = [],
    components: any[] = [],
    settingsObj?: any,
    blueprintObj?: any
  ) {
    const projectPath = path.join(this.projectsDir, projectName);
    const projectJsonPath = path.join(projectPath, 'project.json');

    const settings = settingsObj || JSON.parse(project.settings || '{}');
    const blueprint = blueprintObj || JSON.parse(project.blueprint || '{}');

    // Construct the structured project.json (combining database tables, api, navigation from blueprint)
    const projectJsonContent = {
      name: projectName,
      theme: project.theme,
      id: project.id,
      created_at: project.created_at,
      updated_at: project.updated_at,
      settings: settings,
      screens: screens.map(s => ({
        id: s.id,
        name: s.name,
        layout: typeof s.layout_data === 'string' ? JSON.parse(s.layout_data || '{}') : s.layout_data
      })),
      components: components.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        config: typeof c.config_data === 'string' ? JSON.parse(c.config_data || '{}') : c.config_data
      })),
      blueprint: blueprint // Blueprint Engine JSON
    };

    fs.writeFileSync(projectJsonPath, JSON.stringify(projectJsonContent, null, 2), 'utf8');
  }

  // Synchronise project data and rewrite project.json file
  syncProject(projectId: number) {
    const project = this.db.getProject(projectId);
    if (!project) return;

    const screens = this.db.getScreens(projectId);
    const components = this.db.getComponents(projectId);

    this.writeProjectJson(project.name, project, screens, components);
  }

  // Rename a project
  renameProject(projectId: number, newName: string) {
    const trimmedNewName = newName.trim();
    if (!trimmedNewName) throw new Error('New name cannot be empty');

    const project = this.db.getProject(projectId);
    if (!project) throw new Error('Project not found');

    if (project.name.toLowerCase() === trimmedNewName.toLowerCase()) {
      return; // No change
    }

    // Check duplicate name
    const existing = this.db.getProjectByName(trimmedNewName);
    if (existing) {
      throw new Error(`A project named "${trimmedNewName}" already exists`);
    }

    const oldPath = path.join(this.projectsDir, project.name);
    const newPath = path.join(this.projectsDir, trimmedNewName);

    // Rename folders
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
    } else {
      // If folder didn't exist for some reason, create it
      fs.mkdirSync(newPath, { recursive: true });
    }

    // Update database
    this.db.updateProject(projectId, trimmedNewName, project.theme, project.settings, project.blueprint);

    // Sync to update project.json file
    this.syncProject(projectId);
  }

  // Delete project
  deleteProject(projectId: number) {
    const project = this.db.getProject(projectId);
    if (!project) return;

    // Delete folders
    const projectPath = path.join(this.projectsDir, project.name);
    if (fs.existsSync(projectPath)) {
      this.deleteFolderRecursive(projectPath);
    }

    // Delete from Database
    this.db.deleteProject(projectId);
  }

  // Get project detail including lists
  getProjectDetails(projectId: number) {
    const project = this.db.getProject(projectId);
    if (!project) throw new Error('Project not found');

    const screens = this.db.getScreens(projectId);
    const components = this.db.getComponents(projectId);
    const chatHistory = this.db.getChatHistory(projectId);

    return {
      project,
      screens,
      components,
      chatHistory
    };
  }

  // Save the blueprint data for a project (Step 8 Blueprint Engine)
  saveBlueprint(projectId: number, blueprintObj: any) {
    const project = this.db.getProject(projectId);
    if (!project) throw new Error('Project not found');

    const blueprintStr = JSON.stringify(blueprintObj);

    // Save to DB initially
    this.db.updateProject(projectId, project.name, project.theme, project.settings, blueprintStr);

    // Helper to flatten components to layout elements
    const flattenComponentsToLayoutElements = (components: any[]): any[] => {
      const elements: any[] = [];
      const recurse = (list: any[]) => {
        if (!Array.isArray(list)) return;
        list.forEach(c => {
          let type: string | null = null;
          let extra: any = {};
          
          if (c.type === 'Heading') {
            type = 'Heading';
            extra.content = c.label || c.props?.content || 'Heading';
          } else if (c.type === 'Text') {
            type = 'Text';
            extra.content = c.label || c.props?.content || 'Paragraph text';
          } else if (c.type === 'Button') {
            type = 'Button';
            extra.content = c.label || c.props?.content || 'Button';
          } else if (c.type === 'TextField' || c.type === 'PasswordField') {
            type = 'InputField';
            extra.label = c.label || c.props?.label || 'Input';
          } else if (c.type === 'TopBar') {
            type = 'Header';
            extra.title = c.props?.title || c.label || 'Header';
          } else if (c.type === 'Grid' || c.type === 'ProductCard' || c.type === 'ProductGrid') {
            type = 'ProductGrid';
            extra.itemsCount = c.props?.itemsCount || 4;
          } else if (c.type === 'CartItem' || c.type === 'OrderSummary' || c.type === 'CartList') {
            type = 'CartList';
          } else if (c.type === 'PaymentForm' || c.type === 'CardDetailsForm') {
            type = 'CardDetailsForm';
          } else if (c.type === 'ChatInput' || c.type === 'MessageList' || c.type === 'ChatWidget') {
            type = 'ChatWidget';
          } else if (c.type === 'MapView' || c.type === 'MapWidget') {
            type = 'MapWidget';
            extra.center = c.props?.center || 'Location';
          } else if (c.type === 'BottomNav' || c.type === 'Navbar') {
            type = 'Navbar';
          } else if (c.type === 'Switch' || c.type === 'Toggle') {
            type = 'Toggle';
            extra.label = c.label || c.props?.label || 'Toggle';
          } else if (c.type === 'Calendar' || c.type === 'AgendaView' || c.type === 'WeeklyCalendar' || c.type === 'AppointmentScheduler') {
            type = 'Calendar';
          } else if (c.type === 'NotificationCard' || c.type === 'DirectMessageItem' || c.type === 'ChatBubble') {
            type = 'NotificationCard';
          } else if (c.type === 'Table' || c.type === 'DataGrid' || c.type === 'DataTable') {
            type = 'Table';
          } else if (c.type === 'ListItem' || c.type === 'ListTile' || c.type === 'SwipeableRow') {
            type = 'ListItem';
          } else if (c.type === 'Avatar' || c.type === 'Image' || c.type === 'QrCodeImage') {
            type = 'Avatar';
          } else if (c.type === 'Card' || c.type === 'Accordion' || c.type === 'Carousel') {
            type = 'Card';
          } else if (c.type === 'SearchBar' || c.type === 'AutoComplete') {
            type = 'SearchBar';
          } else if (c.type && (c.type.includes('Chart') || c.type === 'Chart')) {
            type = 'Chart';
          } else if (c.type === 'VideoPlayer' || c.type === 'LiveStreamPlayer') {
            type = 'VideoPlayer';
          } else if (c.type === 'AudioPlayer') {
            type = 'AudioPlayer';
          } else if (c.type === 'Camera' || c.type === 'VideoCamera') {
            type = 'Camera';
          } else if (c.type === 'QRScanner') {
            type = 'QRScanner';
          } else if (c.type === 'MarkdownView' || c.type === 'RichTextView') {
            type = 'MarkdownView';
          } else if (c.type === 'Timeline' || c.type === 'TimelineItem') {
            type = 'Timeline';
          } else if (c.type === 'OTPInput' || c.type === 'OTPVerification' || c.type === 'MfaVerification') {
            type = 'OTPInput';
          } else {
            type = c.type;
            extra.label = c.label || c.type;
          }

          if (type) {
            elements.push({ type, ...extra });
          }

          if (c.children && c.children.length > 0) {
            recurse(c.children);
          }
        });
      };
      recurse(components);
      return elements;
    };

    // Sync screens and components tables in SQLite!
    // 1. Delete old screens and components
    const oldScreens = this.db.getScreens(projectId);
    oldScreens.forEach(s => this.db.deleteScreen(s.id));
    const oldComps = this.db.getComponents(projectId);
    oldComps.forEach(c => this.db.deleteComponent(c.id));

    // 2. Add new screens from blueprintObj.screens
    if (blueprintObj.screens && Array.isArray(blueprintObj.screens)) {
      blueprintObj.screens.forEach((s: any) => {
        let layoutData = s.layout_data || s.layout;
        if (!layoutData || !layoutData.elements) {
          // Flatten from blueprint components!
          const flattened = flattenComponentsToLayoutElements(s.components || []);
          
          // Auto position
          let currentY = 20;
          const positioned = flattened.map((el: any) => {
            const copy = { ...el };
            copy.x = 16;
            copy.w = 262;
            if (copy.type === 'Header') {
              copy.x = 0; copy.y = 0; copy.w = 294; copy.h = 44;
              currentY = 50;
            } else if (copy.type === 'Navbar') {
              copy.x = 0; copy.y = 480; copy.w = 294; copy.h = 44;
            } else {
              copy.y = currentY;
              if (copy.type === 'ProductGrid' || copy.type === 'MapWidget') {
                copy.h = 120; currentY += 130;
              } else if (copy.type === 'ChatWidget') {
                copy.h = 130; currentY += 140;
              } else if (copy.type === 'Text') {
                copy.h = 45; currentY += 55;
              } else {
                copy.h = 36; currentY += 46;
              }
            }
            return copy;
          });
          layoutData = { elements: positioned };
        }
        
        // Save the layout to blueprint screen's layout field so it stays updated
        s.layout = layoutData;

        this.db.createScreen(projectId, s.name, JSON.stringify(layoutData));
      });
    }

    // 3. Add new components from blueprintObj.components
    if (blueprintObj.components && Array.isArray(blueprintObj.components)) {
      blueprintObj.components.forEach((c: any) => {
        const configData = c.config_data || c.config || {};
        this.db.createComponent(projectId, c.name, c.type, JSON.stringify(configData));
      });
    }

    // Save blueprint again with updated layouts embedded
    const updatedBlueprintStr = JSON.stringify(blueprintObj);
    this.db.updateProject(projectId, project.name, project.theme, project.settings, updatedBlueprintStr);

    // Sync to file system
    this.syncProject(projectId);
  }

  // Save specific project settings
  saveSettings(projectId: number, settingsObj: any) {
    const project = this.db.getProject(projectId);
    if (!project) throw new Error('Project not found');

    const theme = settingsObj.theme || project.theme;
    const settingsStr = JSON.stringify(settingsObj);

    this.db.updateProject(projectId, project.name, theme, settingsStr, project.blueprint);
    this.syncProject(projectId);
  }
}

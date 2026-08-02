import path from 'path';
import fs from 'fs';
import { generateReactNativeProject } from './react-native/appGenerator';
import { generateSpringBootProject } from './springboot/appGenerator';
import { exportBlueprintAsSQL, exportBlueprintAsMarkdown } from '../blueprint/exporter';

export class CodeGenerator {
  
  // Initialize and scaffold a runnable Vite React project
  static generateProjectCode(
    projectPath: string,
    projectName: string,
    theme: string,
    blueprintObj: any,
    screens: any[] = []
  ): string[] {
    const generatedFiles: string[] = [];

    // Helper to generate absolute styling elements from visual builder (Phase 5)
    const getScreenLayoutTSX = (screenName: string, fallbackTemplate: string) => {
      const match = screens.find(s => 
        s.name.toLowerCase() === screenName.toLowerCase() || 
        s.name.toLowerCase() === (screenName + 'screen').toLowerCase()
      );
      if (!match) return fallbackTemplate;

      let elements = [];
      try {
        const parsed = typeof match.layout_data === 'string' ? JSON.parse(match.layout_data || '{}') : match.layout_data;
        elements = parsed.elements || [];
      } catch (e) {
        return fallbackTemplate;
      }

      if (elements.length === 0) return fallbackTemplate;

      const elementsTSX = elements.map((el: any, idx: number) => {
        let content = '';
        if (el.type === 'Heading') {
          content = `<DSHeading content="${el.content}" />`;
        } else if (el.type === 'Text') {
          content = `<DSText content="${el.content}" />`;
        } else if (el.type === 'Header') {
          content = `<DSHeader title="${el.title || 'AppHeader'}" />`;
        } else if (el.type === 'Button') {
          content = `<DSButton content="${el.content || 'Tap Button'}" />`;
        } else if (el.type === 'InputField') {
          content = `<DSInputField label="${el.label || 'Input Field'}" />`;
        } else if (el.type === 'ProductGrid') {
          content = `<DSProductGrid itemsCount={${el.itemsCount || 2}} />`;
        } else if (el.type === 'CartList') {
          content = `<DSCartList />`;
        } else if (el.type === 'CardDetailsForm') {
          content = `<DSCardDetailsForm />`;
        } else if (el.type === 'ChatWidget') {
          content = `<DSChatWidget />`;
        } else if (el.type === 'MapWidget') {
          content = `<DSMapWidget center="${el.center || 'GPS Map'}" />`;
        } else if (el.type === 'Navbar') {
          content = `<DSNavbar />`;
        } else {
          content = `<div className="p-2 border border-slate-850 text-slate-650 text-[8px] h-full flex items-center">Element: ${el.type}</div>`;
        }

        return `        <div
          key={${idx}}
          style={{
            position: 'absolute',
            left: '${el.x}px',
            top: '${el.y}px',
            width: '${el.w}px',
            height: '${el.h}px'
          }}
          className="absolute"
        >
          ${content}
        </div>`;
      }).join('\n');

      return `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../theme/theme';
import { 
  DSHeading, DSText, DSHeader, DSButton, DSInputField, 
  DSProductGrid, DSCartList, DSCardDetailsForm, DSChatWidget, 
  DSMapWidget, DSNavbar 
} from '../components/DesignSystem';

export const ${screenName}: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={\`\${theme.bg} flex items-center justify-center h-screen overflow-hidden p-4\`}>
      <div className="w-[294px] h-[540px] border border-slate-850 rounded-2xl relative overflow-hidden bg-[#08090d] shadow-xl">
${elementsTSX}
      </div>
    </div>
  );
};
`;
    };

    // Helper to write file and log path
    const writeFile = (relativeFilePath: string, content: string) => {
      const fullPath = path.join(projectPath, relativeFilePath);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(fullPath, content, 'utf8');
      generatedFiles.push(relativeFilePath);
    };

    // Scaffold folders and Assets manifest (Phase 7 Steps 24 & 28)
    fs.mkdirSync(path.join(projectPath, 'src/assets'), { recursive: true });
    writeFile('src/assets/assets-manifest.json', JSON.stringify({
      assets: [
        { name: 'logo.png', path: 'src/assets/logo.png', type: 'image/png', description: 'Application Logo' },
        { name: 'splash-bg.jpg', path: 'src/assets/splash-bg.jpg', type: 'image/jpeg', description: 'Splash background visual' },
        { name: 'theme-vars.json', path: 'src/assets/theme-vars.json', type: 'application/json', description: 'CSS styling parameters constants' }
      ],
      compiledAt: new Date().toISOString(),
      engine: "AppForge Code Generator Engine v1.0"
    }, null, 2));

    // 1. Write project configurations (Vite, TS, Tailwind v4, Package)
    writeFile('package.json', JSON.stringify({
      name: projectName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      private: true,
      version: '0.1.0',
      type: 'module',
      scripts: {
        "dev": "vite",
        "build": "tsc && vite build",
        "preview": "vite preview"
      },
      dependencies: {
        "react": "^19.2.0",
        "react-dom": "^19.2.0",
        "react-router-dom": "^7.1.0",
        "lucide-react": "^0.400.0"
      },
      devDependencies: {
        "@types/react": "^19.0.0",
        "@types/react-dom": "^19.0.0",
        "vite": "^6.0.0",
        "@vitejs/plugin-react": "^4.3.0",
        "typescript": "^5.6.0",
        "tailwindcss": "^4.0.0",
        "@tailwindcss/vite": "^4.0.0"
      }
    }, null, 2));

    writeFile('vite.config.ts', `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
`);

    writeFile('tsconfig.json', `{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
`);

    writeFile('index.html', `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220%22 width=%22100%22 height=%22100%22><text y=%220.9em%22 font-size=%2290%22>⚙️</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet" />
    <title>${projectName} - AppForge Generated</title>
  </head>
  <body class="m-0 p-0">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`);

    // 2. Write CSS Style Sheets with Tailwind imports
    writeFile('src/index.css', `@import "tailwindcss";

@layer base {
  body {
    margin: 0;
    font-family: 'Inter', system-ui, sans-serif;
  }
}
`);

    // 3. Write Theme styles based on choice (Dark, Light, Material, Glass) (Step 12)
    let themeConfig = '';
    if (theme.toLowerCase() === 'light') {
      themeConfig = `export const theme = {
  name: 'light',
  bg: 'bg-slate-50 min-h-screen text-slate-800',
  card: 'bg-white border border-slate-200 shadow-sm rounded-2xl p-6 transition-all',
  input: 'w-full bg-slate-100 border border-slate-300 rounded-xl py-2.5 px-4 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors',
  buttonPrimary: 'w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-xl text-sm shadow transition-all cursor-pointer text-center block',
  buttonSecondary: 'w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2.5 px-5 rounded-xl text-sm transition-all cursor-pointer text-center block',
  heading: 'text-2xl font-bold text-slate-900 tracking-tight font-outfit',
  subheading: 'text-sm text-slate-500 font-medium',
  border: 'border-slate-200'
};`;
    } else if (theme.toLowerCase() === 'material') {
      themeConfig = `export const theme = {
  name: 'material',
  bg: 'bg-[#fafafa] min-h-screen text-[#212121]',
  card: 'bg-white shadow-[0_2px_5px_0_rgba(0,0,0,0.16)] rounded-lg p-6 transition-shadow hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.22)]',
  input: 'w-full bg-transparent border-b-2 border-slate-300 py-2.5 text-sm text-[#212121] focus:outline-none focus:border-[#6200ee] transition-colors',
  buttonPrimary: 'w-full bg-[#6200ee] hover:bg-[#3700b3] text-white uppercase tracking-wider font-bold py-3 px-6 rounded-md text-xs shadow-md hover:shadow-lg transition-all cursor-pointer text-center block',
  buttonSecondary: 'w-full bg-transparent hover:bg-slate-100 text-[#6200ee] border border-[#6200ee] uppercase tracking-wider font-bold py-2.5 px-5 rounded-md text-xs transition-all cursor-pointer text-center block',
  heading: 'text-xl font-bold text-[#212121] tracking-wide',
  subheading: 'text-xs text-slate-500 uppercase tracking-widest',
  border: 'border-slate-300'
};`;
    } else if (theme.toLowerCase() === 'glassmorphic' || theme.toLowerCase() === 'glass') {
      themeConfig = `export const theme = {
  name: 'glassmorphic',
  bg: 'bg-gradient-to-tr from-[#0f172a] via-[#1e1e38] to-[#020617] min-h-screen text-slate-200',
  card: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-6 transition-all hover:bg-white/10 hover:border-white/20',
  input: 'w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all',
  buttonPrimary: 'w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-2xl text-sm shadow-lg shadow-violet-500/20 transition-all cursor-pointer text-center block',
  buttonSecondary: 'w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all cursor-pointer text-center block',
  heading: 'text-3xl font-extrabold text-white tracking-tight font-outfit bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent',
  subheading: 'text-xs font-semibold text-violet-400 uppercase tracking-widest',
  border: 'border-white/10'
};`;
    } else {
      // Default: Dark Mode
      themeConfig = `export const theme = {
  name: 'dark',
  bg: 'bg-[#0b0c10] min-h-screen text-[#c5c6c7]',
  card: 'bg-[#1f2833] border border-slate-800 rounded-2xl p-6 shadow-xl transition-all',
  input: 'w-full bg-[#0b0c10] border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-300 focus:outline-none focus:border-violet-500 transition-colors',
  buttonPrimary: 'w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 px-5 rounded-xl text-sm shadow-md shadow-violet-500/20 transition-all cursor-pointer text-center block',
  buttonSecondary: 'w-full bg-[#1f2833] hover:bg-[#242e3b] text-slate-400 border border-slate-800 font-semibold py-2.5 px-5 rounded-xl text-sm transition-all cursor-pointer text-center block',
  heading: 'text-2xl font-bold text-white tracking-wide font-outfit',
  subheading: 'text-xs text-slate-500 tracking-wider',
  border: 'border-slate-800'
};`;
    }
    writeFile('src/theme/theme.ts', themeConfig);

    // 4. Write Custom Components (Step 11)
    writeFile('src/components/DesignSystem.tsx', `import React from 'react';

// Design System components for dynamic rendering
export const DSHeading: React.FC<{ content: string }> = ({ content }) => (
  <h3 className="text-xs font-black tracking-wide w-full h-full flex items-center text-white">{content}</h3>
);

export const DSText: React.FC<{ content: string }> = ({ content }) => (
  <p className="text-[10px] leading-relaxed w-full h-full overflow-hidden text-slate-400">{content}</p>
);

export const DSHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="w-full h-full px-3 flex items-center justify-between bg-[#181a24] border-b border-slate-850 text-white">
    <span className="text-[10px] font-black tracking-wide">{title}</span>
    <div className="w-3 h-3 rounded-full bg-slate-700/30" />
  </div>
);

export const DSButton: React.FC<{ content: string; onClick?: () => void }> = ({ content, onClick }) => (
  <button onClick={onClick} className="w-full h-full font-bold text-[10px] shadow-sm flex items-center justify-center transition-all bg-violet-600 hover:bg-violet-500 text-white rounded-xl cursor-pointer">
    {content}
  </button>
);

export const DSInputField: React.FC<{ label: string }> = ({ label }) => (
  <div className="w-full h-full flex flex-col justify-center text-left">
    <span className="block text-[8px] font-extrabold text-slate-500 uppercase tracking-wide mb-0.5">{label}</span>
    <input type="text" disabled placeholder="Enter value..." className="w-full py-1 px-2.5 text-[9px] bg-[#08090d] border border-slate-800 text-slate-400 rounded-xl" />
  </div>
);

export const DSProductGrid: React.FC<{ itemsCount: number }> = ({ itemsCount }) => (
  <div className="grid grid-cols-2 gap-2 w-full h-full overflow-hidden">
    {Array.from({ length: itemsCount || 2 }).map((_, i) => (
      <div key={i} className="p-2 text-left h-full bg-[#181a24] border border-slate-850 rounded-2xl flex flex-col justify-between">
        <div className="w-full h-10 bg-black/20 rounded-md" />
        <div className="h-1.5 w-12 bg-slate-700/30 rounded" />
      </div>
    ))}
  </div>
);

export const DSCartList: React.FC = () => (
  <div className="flex flex-col gap-1.5 w-full h-full overflow-hidden">
    {[{ n: 'Item A', p: '$14.99' }, { n: 'Item B', p: '$3.50' }].map((item, i) => (
      <div key={i} className="flex items-center justify-between p-1.5 bg-[#181a24] border border-slate-850 rounded-2xl text-[10px] text-white">
        <span className="font-semibold truncate max-w-[80px]">{item.n}</span>
        <span className="font-bold text-violet-400 text-[8px]">{item.p}</span>
      </div>
    ))}
  </div>
);

export const DSCardDetailsForm: React.FC = () => (
  <div className="p-2 text-left w-full h-full bg-[#181a24] border border-slate-850 rounded-2xl flex flex-col justify-between">
    <div className="h-2 w-16 bg-slate-700/30 rounded" />
    <div className="h-5 w-full bg-black/20 rounded" />
    <div className="grid grid-cols-2 gap-1.5">
      <div className="h-5 bg-black/20 rounded" />
      <div className="h-5 bg-black/20 rounded" />
    </div>
  </div>
);

export const DSChatWidget: React.FC = () => (
  <div className="flex flex-col gap-1.5 w-full h-full p-2 border border-slate-850 bg-[#08090d] rounded-xl overflow-y-auto">
    <div className="bg-slate-700/10 text-slate-400 text-[8px] p-1.5 rounded max-w-[85%] self-start">Hi, how can I assist?</div>
    <div className="bg-violet-600 text-white text-[8px] p-1.5 rounded max-w-[85%] self-end">Analyze app specs.</div>
  </div>
);

export const DSMapWidget: React.FC<{ center: string }> = ({ center }) => (
  <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-[#181a24] border border-slate-850 rounded-2xl">
    <div className="absolute inset-0 bg-slate-950 bg-[radial-gradient(#4a4f6d_1px,transparent_1px)] [background-size:12px_12px] opacity-20" />
    <div className="absolute w-2.5 h-2.5 bg-blue-500 border-2 border-white rounded-full glow-pulse shadow-md" />
    <span className="absolute bottom-1 left-1 bg-slate-900/90 border border-slate-800 text-[7px] px-1 py-0.5 rounded text-slate-400 font-semibold">{center}</span>
  </div>
);

export const DSNavbar: React.FC = () => (
  <div className="w-full h-full flex justify-around items-center bg-[#181a24] border-t border-slate-850 text-slate-400">
    {['🏠', '🔍', '🛒', '⚙️'].map((ico, idx) => (
      <span key={idx} className="text-xs cursor-pointer">{ico}</span>
    ))}
  </div>
);
`);

    writeFile('src/components/Text.tsx', `import React from 'react';
import { theme } from '../theme/theme';

interface TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'body' | 'caption';
  className?: string;
}

export const Text: React.FC<TextProps> = ({ children, variant = 'body', className = '' }) => {
  if (variant === 'h1') return <h1 className={\`\${theme.heading} \${className}\`}>{children}</h1>;
  if (variant === 'h2') return <h2 className={\`text-lg font-semibold text-white tracking-wide \${className}\`}>{children}</h2>;
  if (variant === 'caption') return <span className={\`\${theme.subheading} \${className}\`}>{children}</span>;
  return <p className={\`text-sm leading-relaxed text-slate-400 \${className}\`}>{children}</p>;
};
`);

    writeFile('src/components/Button.tsx', `import React from 'react';
import { theme } from '../theme/theme';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  className = '',
}) => {
  const btnStyle = variant === 'primary' ? theme.buttonPrimary : theme.buttonSecondary;
  return (
    <button type={type} onClick={onClick} className={\`\${btnStyle} \${className}\`}>
      {children}
    </button>
  );
};
`);

    writeFile('src/components/Card.tsx', `import React from 'react';
import { theme } from '../theme/theme';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={\`\${theme.card} \${className}\`}>{children}</div>;
};
`);

    writeFile('src/components/Image.tsx', `import React from 'react';

interface ImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const Image: React.FC<ImageProps> = ({ src, alt, className = '' }) => {
  return (
    <div className={\`overflow-hidden rounded-xl bg-slate-900/50 \${className}\`}>
      <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
    </div>
  );
};
`);

    writeFile('src/components/Search.tsx', `import React from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { theme } from '../theme/theme';

interface SearchProps {
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const Search: React.FC<SearchProps> = ({ placeholder = 'Search...', onChange, className = '' }) => {
  return (
    <div className={\`relative w-full \${className}\`}>
      <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
      <input
        type="text"
        placeholder={placeholder}
        onChange={onChange}
        className={\`\${theme.input} pl-11\`}
      />
    </div>
  );
};
`);

    writeFile('src/components/Form.tsx', `import React from 'react';
import { theme } from '../theme/theme';

interface FormField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
}

interface FormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => void;
  submitLabel?: string;
  className?: string;
}

export const Form: React.FC<FormProps> = ({ fields, onSubmit, submitLabel = 'Submit', className = '' }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    fields.forEach(f => {
      data[f.name] = formData.get(f.name) as string || '';
    });
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className={\`flex flex-col gap-4 w-full \${className}\`}>
      {fields.map((f, i) => (
        <div key={i} className="text-left">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">{f.label}</label>
          <input
            name={f.name}
            type={f.type}
            placeholder={f.placeholder}
            required={f.required}
            className={theme.input}
          />
        </div>
      ))}
      <button type="submit" className={\`\${theme.buttonPrimary} mt-3\`}>
        {submitLabel}
      </button>
    </form>
  );
};
`);

    // 5. Write Generated Screens (Step 9)
    const splashTemplate = `import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../theme/theme';
import { Text } from '../components/Text';

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2200);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={\`\${theme.bg} flex flex-col items-center justify-center h-screen overflow-hidden\`}>
      <div className="text-center flex flex-col gap-4 items-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-white text-3xl shadow-xl shadow-violet-500/20 animate-pulse">
          ⚙️
        </div>
        <Text variant="h1">${projectName}</Text>
        <Text variant="caption">Launching application...</Text>
      </div>
    </div>
  );
};
`;
    writeFile('src/screens/SplashScreen.tsx', getScreenLayoutTSX('SplashScreen', splashTemplate));

    const loginTemplate = `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { Text } from '../components/Text';
import { Form } from '../components/Form';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSubmit = (data: Record<string, string>) => {
    console.log('Login credentials:', data);
    navigate('/home');
  };

  return (
    <div className={\`\${theme.bg} flex items-center justify-center p-6 h-screen overflow-hidden\`}>
      <Card className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Text variant="h1">Sign In</Text>
          <Text className="mt-1">Access your ${projectName} account</Text>
        </div>

        <Form
          fields={[
            { name: 'email', label: 'Email Address', type: 'email', placeholder: 'e.g. you@example.com', required: true },
            { name: 'password', label: 'Security Password', type: 'password', placeholder: '••••••••', required: true }
          ]}
          submitLabel="Login to Workspace"
          onSubmit={handleLoginSubmit}
        />

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/signup')}
            className="text-xs text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
          >
            Create a new account
          </button>
        </div>
      </Card>
    </div>
  );
};
`;
    writeFile('src/screens/LoginScreen.tsx', getScreenLayoutTSX('LoginScreen', loginTemplate));

    const signupTemplate = `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { Text } from '../components/Text';
import { Form } from '../components/Form';

export const SignupScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleRegisterSubmit = (data: Record<string, string>) => {
    console.log('Registered data:', data);
    navigate('/login');
  };

  return (
    <div className={\`\${theme.bg} flex items-center justify-center p-6 h-screen overflow-hidden\`}>
      <Card className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Text variant="h1">Get Started</Text>
          <Text className="mt-1">Create your developer profile</Text>
        </div>

        <Form
          fields={[
            { name: 'name', label: 'Full Name', type: 'text', placeholder: 'e.g. John Doe', required: true },
            { name: 'email', label: 'Email Address', type: 'email', placeholder: 'e.g. you@example.com', required: true },
            { name: 'password', label: 'Security Password', type: 'password', placeholder: 'Min. 8 characters', required: true }
          ]}
          submitLabel="Create Profile"
          onSubmit={handleRegisterSubmit}
        />

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/login')}
            className="text-xs text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
          >
            Already have an account? Sign In
          </button>
        </div>
      </Card>
    </div>
  );
};
`;
    writeFile('src/screens/SignupScreen.tsx', getScreenLayoutTSX('SignupScreen', signupTemplate));

    const homeTemplate = `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Search } from '../components/Search';
import { ShoppingBag, LogOut, User, Settings as SettingsIcon } from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={\`\${theme.bg} flex flex-col h-screen overflow-hidden\`}>
      <header className={\`p-4 border-b \${theme.border} flex justify-between items-center bg-black/10\`}>
        <span className="font-extrabold text-white text-lg font-outfit tracking-wide">${projectName}</span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="!w-auto !py-2 !px-3 flex items-center gap-1.5" onClick={() => navigate('/profile')}>
            <User size={14} /> Profile
          </Button>
          <button onClick={() => navigate('/login')} className="p-2 text-slate-500 hover:text-white cursor-pointer" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-xl mx-auto w-full">
        <Search placeholder="Find products, services..." />

        <Card className="flex flex-col gap-2 relative overflow-hidden text-left">
          <div className="absolute right-0 top-0 w-24 h-24 bg-violet-500/10 rounded-full blur-xl" />
          <Text variant="caption">Application Dashboard</Text>
          <Text variant="h2">Generated Blueprint Modules</Text>
          <Text className="mt-1">
            This represents the local runtime of ${projectName}. Navigate to screens using bottom tab flows.
          </Text>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 flex flex-col gap-2 items-center text-center">
            <div className="p-2.5 rounded-xl bg-violet-600/10 text-violet-400">
              <ShoppingBag size={20} />
            </div>
            <Text variant="h2" className="!text-xs">My Shopping Cart</Text>
            <Button variant="secondary" className="!py-1.5 !px-3 !text-[10px] mt-2" onClick={() => navigate('/cart')}>
              Open Cart
            </Button>
          </Card>
          
          <Card className="p-4 flex flex-col gap-2 items-center text-center">
            <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-400">
              <SettingsIcon size={20} />
            </div>
            <Text variant="h2" className="!text-xs">App Settings</Text>
            <Button variant="secondary" className="!py-1.5 !px-3 !text-[10px] mt-2" onClick={() => navigate('/settings')}>
              Edit Settings
            </Button>
          </Card>
        </div>
      </div>

      <footer className={\`p-3 border-t \${theme.border} bg-black/20 flex justify-around items-center\`}>
        {['home', 'profile', 'cart', 'settings'].map((tab) => (
          <button
            key={tab}
            onClick={() => navigate(\`/\${tab}\`)}
            className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-white capitalize cursor-pointer font-semibold text-[10px]"
          >
            {tab === 'home' && <ShoppingBag size={18} />}
            {tab === 'profile' && <User size={18} />}
            {tab === 'cart' && <ShoppingBag size={18} />}
            {tab === 'settings' && <SettingsIcon size={18} />}
            {tab}
          </button>
        ))}
      </footer>
    </div>
  );
};
`;
    writeFile('src/screens/HomeScreen.tsx', getScreenLayoutTSX('HomeScreen', homeTemplate));

    const settingsTemplate = `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { ChevronLeft, Volume2, Shield } from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={\`\${theme.bg} p-6 flex flex-col gap-6 max-w-xl mx-auto w-full h-screen overflow-hidden\`}>
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/home')} className="text-slate-400 hover:text-white cursor-pointer">
          <ChevronLeft size={20} />
        </button>
        <Text variant="h1">App Settings</Text>
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between p-3.5 bg-black/10 rounded-xl">
          <div className="flex items-center gap-3">
            <Volume2 className="text-violet-400" size={16} />
            <Text variant="h2" className="!text-xs">Sound Alerts & Notifications</Text>
          </div>
          <input type="checkbox" className="accent-violet-500 w-4 h-4 cursor-pointer" defaultChecked />
        </div>

        <div className="flex items-center justify-between p-3.5 bg-black/10 rounded-xl">
          <div className="flex items-center gap-3">
            <Shield className="text-violet-400" size={16} />
            <Text variant="h2" className="!text-xs">Secure Sandbox Profiles</Text>
          </div>
          <input type="checkbox" className="accent-violet-500 w-4 h-4 cursor-pointer" />
        </div>
      </Card>

      <Button variant="secondary" onClick={() => navigate('/home')}>Return Home</Button>
    </div>
  );
};
`;
    writeFile('src/screens/SettingsScreen.tsx', getScreenLayoutTSX('SettingsScreen', settingsTemplate));

    const profileTemplate = `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { ChevronLeft, Award } from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={\`\${theme.bg} p-6 flex flex-col gap-6 max-w-xl mx-auto w-full h-screen overflow-hidden\`}>
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/home')} className="text-slate-400 hover:text-white cursor-pointer">
          <ChevronLeft size={20} />
        </button>
        <Text variant="h1">Developer Profile</Text>
      </div>

      <div className="flex items-center gap-4 py-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xl">
          GD
        </div>
        <div className="text-left">
          <Text variant="h2">Guest Developer</Text>
          <Text className="text-xs">appforge.dev@local.host</Text>
        </div>
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-violet-600/10 text-violet-400 rounded-xl">
            <Award size={18} />
          </div>
          <div className="text-left">
            <Text variant="h2" className="!text-xs">Security Badges</Text>
            <Text className="text-[11px] mt-0.5">Offline execution mode engaged</Text>
          </div>
        </div>
      </Card>

      <Button onClick={() => navigate('/home')}>Done</Button>
    </div>
  );
};
`;
    writeFile('src/screens/ProfileScreen.tsx', getScreenLayoutTSX('ProfileScreen', profileTemplate));

    const cartTemplate = `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { ChevronLeft } from 'lucide-react';

export const CartScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={\`\${theme.bg} p-6 flex flex-col gap-6 max-w-xl mx-auto w-full h-screen overflow-hidden\`}>
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/home')} className="text-slate-400 hover:text-white cursor-pointer">
          <ChevronLeft size={20} />
        </button>
        <Text variant="h1">Shopping Cart</Text>
      </div>

      <div className="flex flex-col gap-3">
        {[
          { name: 'Gourmet Meal Pack', price: '$24.99', count: 1 },
          { name: 'Refreshment Soda Can', price: '$3.50', count: 2 }
        ].map((item, i) => (
          <Card key={i} className="flex justify-between items-center p-4">
            <div className="text-left">
              <Text variant="h2" className="!text-xs">{item.name}</Text>
              <Text className="text-[10px] mt-0.5">Quantity: {item.count}</Text>
            </div>
            <span className="text-xs font-bold text-violet-400">{item.price}</span>
          </Card>
        ))}
      </div>

      <Button onClick={() => alert('Order completed! (Simulated checkout)')}>Proceed to Payments</Button>
    </div>
  );
};
`;
    writeFile('src/screens/CartScreen.tsx', getScreenLayoutTSX('CartScreen', cartTemplate));

    // Custom screens compiled dynamically (Phase 5)
    screens.forEach(s => {
      const standardNames = ['splash', 'login', 'signup', 'home', 'settings', 'profile', 'cart'];
      const normalizedName = s.name.replace(/screen/i, '').toLowerCase();
      if (!standardNames.includes(normalizedName)) {
        const screenTemplate = getScreenLayoutTSX(s.name, `import React from 'react';
import { theme } from '../theme/theme';
export const \${s.name}: React.FC = () => {
  return (
    <div className={\`\${theme.bg} flex items-center justify-center p-6 h-screen overflow-hidden\`}>
      <div className="text-center text-white">Screen \${s.name}</div>
    </div>
  );
};
`);
        writeFile(`src/screens/\${s.name}.tsx`, screenTemplate);
      }
    });

    // 6. Write Navigation Flow (Step 10)
    if (screens.length > 0) {
      const imports = screens.map(s => `import { ${s.name} } from '../screens/${s.name}';`).join('\n');
      const routeElements = screens.map(s => {
        let pathStr = `/${s.name.replace(/screen/i, '').toLowerCase()}`;
        if (s.name.toLowerCase() === 'splashscreen' || s.name.toLowerCase() === 'splash') pathStr = '/';
        return `      <Route path="${pathStr}" element={<${s.name} />} />`;
      }).join('\n');

      writeFile('src/navigation/AppNavigator.tsx', `import React from 'react';
import { Routes, Route } from 'react-router-dom';
${imports}

export const AppNavigator: React.FC = () => {
  return (
    <Routes>
${routeElements}
    </Routes>
  );
};
`);
    } else {
      writeFile('src/navigation/AppNavigator.tsx', `import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CartScreen } from '../screens/CartScreen';

export const AppNavigator: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/signup" element={<SignupScreen />} />
      <Route path="/home" element={<HomeScreen />} />
      <Route path="/settings" element={<SettingsScreen />} />
      <Route path="/profile" element={<ProfileScreen />} />
      <Route path="/cart" element={<CartScreen />} />
    </Routes>
  );
};
`);
    }

    // 7. Write App Entry Points
    writeFile('src/App.tsx', `import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppNavigator } from './navigation/AppNavigator';

function App() {
  return (
    <BrowserRouter>
      <AppNavigator />
    </BrowserRouter>
  );
}

export default App;
`);

    writeFile('src/main.tsx', `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`);

    // --- Backend and Database Generator (Phases 8 & 9) ---
    const tables = (blueprintObj.database && blueprintObj.database.tables && blueprintObj.database.tables.length > 0)
      ? blueprintObj.database.tables
      : [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'INTEGER', primaryKey: true },
              { name: 'email', type: 'VARCHAR', unique: true },
              { name: 'password', type: 'VARCHAR' },
              { name: 'role', type: 'VARCHAR' }
            ]
          },
          {
            name: 'orders',
            columns: [
              { name: 'id', type: 'INTEGER', primaryKey: true },
              { name: 'user_id', type: 'INTEGER', foreignKey: { table: 'users', column: 'id' } },
              { name: 'total', type: 'DECIMAL' },
              { name: 'status', type: 'VARCHAR' }
            ]
          }
        ];

    const toCamelCase = (str: string) => str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    const toCapitalCamel = (str: string) => {
      const cc = toCamelCase(str);
      return cc.charAt(0).toUpperCase() + cc.slice(1);
    };
    const getJavaType = (sqlType: string) => {
      const type = sqlType.toUpperCase();
      if (type.startsWith('INT') || type === 'INTEGER') return 'Long';
      if (type.startsWith('VARCHAR') || type === 'TEXT') return 'String';
      if (type.startsWith('DECIMAL') || type === 'DOUBLE' || type === 'FLOAT') return 'Double';
      if (type.startsWith('BOOL')) return 'Boolean';
      return 'String';
    };

    // 1. pom.xml (Step 29)
    writeFile('backend/pom.xml', `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
    <relativePath/>
  </parent>
  <groupId>com.appforge</groupId>
  <artifactId>backend</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <name>backend</name>
  <description>Spring Boot backend generated by AppForge AI</description>
  <properties>
    <java.version>17</java.version>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
      <groupId>io.jsonwebtoken</groupId>
      <artifactId>jjwt-api</artifactId>
      <version>0.11.5</version>
    </dependency>
    <dependency>
      <groupId>io.jsonwebtoken</groupId>
      <artifactId>jjwt-impl</artifactId>
      <version>0.11.5</version>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>io.jsonwebtoken</groupId>
      <artifactId>jjwt-jackson</artifactId>
      <version>0.11.5</version>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>org.xerial</groupId>
      <artifactId>sqlite-jdbc</artifactId>
      <version>3.42.0.0</version>
    </dependency>
    <dependency>
      <groupId>org.hibernate.orm</groupId>
      <artifactId>hibernate-community-dialects</artifactId>
      <version>6.2.7.Final</version>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>
`);

    // 2. Application Entry (Step 29)
    writeFile('backend/src/main/java/com/appforge/AppForgeApplication.java', `package com.appforge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AppForgeApplication {
    public static void main(String[] args) {
        SpringApplication.run(AppForgeApplication.class, args);
    }
}
`);

    // 3. application.properties
    writeFile('backend/src/main/resources/application.properties', `spring.datasource.url=jdbc:sqlite:data.db
spring.datasource.driver-class-name=org.sqlite.JDBC
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
spring.jpa.hibernate.ddl-auto=none
spring.sql.init.mode=always
server.port=8080
`);

    // 4. JWT Configs & Filters (Step 30)
    writeFile('backend/src/main/java/com/appforge/config/JwtTokenProvider.java', `package com.appforge.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {
    private static final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    private static final long EXPIRATION_TIME = 86400000;

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody().getSubject();
    }
}
`);

    writeFile('backend/src/main/java/com/appforge/config/JwtFilter.java', `package com.appforge.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {
    @Autowired
    private JwtTokenProvider tokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (tokenProvider.validateToken(token)) {
                String username = tokenProvider.getUsernameFromToken(token);
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        username, null, Collections.emptyList());
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        filterChain.doFilter(request, response);
    }
}
`);

    writeFile('backend/src/main/java/com/appforge/config/SecurityConfig.java', `package com.appforge.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
`);

    // 5. Relational JPA Entities (Step 34)
    tables.forEach((table: any) => {
        const className = toCapitalCamel(table.name);
        let fieldsJava = '';
        let imports = 'import jakarta.persistence.*;\n';

        table.columns.forEach((col: any) => {
            const fieldName = toCamelCase(col.name);
            const javaType = getJavaType(col.type);

            if (col.primaryKey) {
                fieldsJava += `    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private ${javaType} ${fieldName};\n\n`;
            } else if (col.foreignKey) {
                const targetClass = toCapitalCamel(col.foreignKey.table);
                fieldsJava += `    @ManyToOne\n    @JoinColumn(name = "${col.name}")\n    private ${targetClass} ${fieldName.replace('Id', '')};\n\n`;
            } else {
                fieldsJava += `    @Column(name = "${col.name}"${col.unique ? ', unique = true' : ''})\n    private ${javaType} ${fieldName};\n\n`;
            }
        });

        writeFile(`backend/src/main/java/com/appforge/model/${className}.java`, `package com.appforge.model;\n\n${imports}
@Entity
@Table(name = "${table.name}")
public class ${className} {
${fieldsJava}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
}
`);

        // Repository interfaces
        writeFile(`backend/src/main/java/com/appforge/repository/${className}Repository.java`, `package com.appforge.repository;

import com.appforge.model.${className};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ${className}Repository extends JpaRepository<${className}, Long> {
}
`);

        // CRUD REST Controllers (Step 31)
        writeFile(`backend/src/main/java/com/appforge/controller/${className}Controller.java`, `package com.appforge.controller;

import com.appforge.model.${className};
import com.appforge.repository.${className}Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/${table.name}")
public class ${className}Controller {
    @Autowired
    private ${className}Repository repository;

    @GetMapping
    public List<${className}> getAll() { return repository.findAll(); }

    @PostMapping
    public ${className} create(@RequestBody ${className} entity) { return repository.save(entity); }

    @GetMapping("/{id}")
    public ${className} getById(@PathVariable Long id) { return repository.findById(id).orElseThrow(() -> new RuntimeException("Not found")); }

    @PutMapping("/{id}")
    public ${className} update(@PathVariable Long id, @RequestBody ${className} entity) {
        entity.setId(id);
        return repository.save(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { repository.deleteById(id); }
}
`);
    });

    // 6. Admin Panel (Step 32)
    writeFile('backend/src/main/java/com/appforge/controller/AdminController.java', `package com.appforge.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("status", "Active");
        stats.put("registeredControllersCount", ${tables.length});
        stats.put("databaseDialect", "SQLiteDialect");
        stats.put("version", "1.0.0");
        return stats;
    }
}
`);

    // 7. Generate SQL Schema (Step 33 & 34)
    let schemaSQL = '';
    tables.forEach((table: any) => {
        let columnsSQL = '';
        let foreignKeysSQL = '';
        table.columns.forEach((col: any) => {
            let colDef = `${col.name} ${col.type}`;
            if (col.primaryKey) colDef += ' PRIMARY KEY AUTOINCREMENT';
            if (col.unique) colDef += ' UNIQUE';
            if (col.notNull) colDef += ' NOT NULL';
            columnsSQL += `  ${colDef},\n`;

            if (col.foreignKey) {
                foreignKeysSQL += `  FOREIGN KEY (${col.name}) REFERENCES ${col.foreignKey.table}(${col.foreignKey.column}),\n`;
            }
        });
        schemaSQL += `CREATE TABLE IF NOT EXISTS ${table.name} (\n${columnsSQL}${foreignKeysSQL}`.slice(0, -2) + '\n);\n\n';
    });
    writeFile('backend/src/main/resources/schema.sql', schemaSQL);

    // 8. Generate SQL Seed Data (Step 35)
    let dataSQL = '-- Seed data generated by AppForge AI\n';
    tables.forEach((table: any) => {
        if (table.name === 'users') {
            dataSQL += `INSERT OR IGNORE INTO users (id, email, password, role) VALUES (1, 'admin@appforge.ai', 'hashed_pass_here', 'ADMIN');\n`;
            dataSQL += `INSERT OR IGNORE INTO users (id, email, password, role) VALUES (2, 'guest@appforge.ai', 'guest_pass_here', 'DEVELOPER');\n`;
        } else if (table.name === 'orders') {
            dataSQL += `INSERT OR IGNORE INTO orders (id, user_id, total, status) VALUES (1, 1, 49.99, 'COMPLETED');\n`;
            dataSQL += `INSERT OR IGNORE INTO orders (id, user_id, total, status) VALUES (2, 2, 9.50, 'PENDING');\n`;
        } else {
            dataSQL += `-- Seed values for table ${table.name}\n`;
        }
    });
    writeFile('backend/src/main/resources/data.sql', dataSQL);

    // ── Single Source of Truth App Generators Alignment ────────────────────
    
    // 1. React Native mobile frontend generation
    try {
      const rnFiles = generateReactNativeProject(blueprintObj);
      rnFiles.forEach(file => {
        writeFile(path.join('frontend-rn', file.path), file.content);
      });
    } catch (e) {
      console.error('[CodeGenerator] React Native generation failed:', e);
    }

    // 2. Spring Boot backend service generation
    try {
      const sbFiles = generateSpringBootProject(blueprintObj);
      sbFiles.forEach(file => {
        writeFile(path.join('backend-sb', file.path), file.content);
      });
    } catch (e) {
      console.error('[CodeGenerator] Spring Boot generation failed:', e);
    }

    // 3. Database SQL script schema generation
    try {
      const dbSql = exportBlueprintAsSQL(blueprintObj);
      writeFile('database/schema.sql', dbSql);
    } catch (e) {
      console.error('[CodeGenerator] SQL export failed:', e);
    }

    // 4. Blueprint Specification Markdown documentation generation
    try {
      const mdDoc = exportBlueprintAsMarkdown(blueprintObj);
      writeFile('docs/BLUEPRINT.md', mdDoc);
    } catch (e) {
      console.error('[CodeGenerator] Markdown doc export failed:', e);
    }

    return generatedFiles;
  }
}

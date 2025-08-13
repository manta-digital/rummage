# Rummage - Development Environment Setup Guide

**Project:** Rummage - Local-First AI Photo & File Librarian  
**Date:** 2025-08-12  
**Target:** Development Environment Configuration

---

## Prerequisites

### Required Software
- **Node.js:** v20.0.0 or later (LTS recommended)
- **pnpm:** v8.0.0 or later (package manager)
- **Git:** Latest version
- **VS Code:** Recommended editor with extensions

### Optional (for enhanced development)
- **Ollama:** For local LLM testing (optional feature)
- **Python 3.8+:** For some build tools if needed

---

## Step 1: Install Core Dependencies

### Install Node.js
```bash
# Check if already installed
node --version
pnpm --version

# If not installed, download from https://nodejs.org/
# Or use a version manager like fnm/nvm
```

### Install pnpm (if not already installed)
```bash
# Install pnpm globally
npm install -g pnpm

# Verify installation
pnpm --version
```

### Install Ollama (Optional - for LLM features)
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows - Download from https://ollama.ai/
```

---

## Step 2: Project Initialization

### Create Project Directory
```bash
mkdir rummage
cd rummage

# Initialize with pnpm
pnpm init

# Initialize git repository
git init
echo "node_modules/" > .gitignore
echo "dist/" >> .gitignore
echo ".DS_Store" >> .gitignore
echo "*.log" >> .gitignore
```

### Set up AI Project Guide Scripts

Create initial `package.json` with AI-friendly scripts:

```json
{
  "name": "rummage",
  "version": "1.0.0",
  "description": "Local-first AI photo and file librarian",
  "main": "dist/main/main.js",
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "preview": "electron-vite preview",
    "package": "electron-builder",
    "test": "vitest",
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
    "typecheck": "tsc --noEmit",
    "ai:dev": "pnpm run dev",
    "ai:build": "pnpm run build && pnpm run package",
    "ai:clean": "rm -rf dist node_modules && pnpm install",
    "ai:test": "pnpm run typecheck && pnpm run lint && pnpm run test",
    "ai:setup": "pnpm install && pnpm run typecheck"
  },
  "keywords": ["electron", "ai", "photos", "file-manager", "local-first"],
  "author": "Your Name",
  "license": "Apache-2.0",
  "devDependencies": {},
  "dependencies": {}
}
```

---

## Step 3: Install Core Dependencies

### Install Electron and Build Tools
```bash
# Core Electron development stack
pnpm add -D electron electron-vite electron-builder

# TypeScript and build tools
pnpm add -D typescript @types/node vite

# React and TypeScript types
pnpm add react react-dom
pnpm add -D @types/react @types/react-dom

# Tailwind CSS v4 (following our guides)
pnpm add -D tailwindcss@latest @tailwindcss/vite

# Development and testing tools
pnpm add -D vitest eslint @typescript-eslint/eslint-plugin
pnpm add -D @typescript-eslint/parser eslint-plugin-react
```

### Install Core Application Dependencies
```bash
# Database and vector search
pnpm add better-sqlite3 sqlite-vec

# ONNX Runtime for embeddings
pnpm add onnxruntime-node

# File hashing (both xxhash and BLAKE3)
pnpm add hash-wasm

# Optional: Ollama for local LLM
pnpm add ollama

# Utility libraries
pnpm add lodash-es date-fns
pnpm add -D @types/lodash-es

# UI components (shadcn/ui compatible)
pnpm add class-variance-authority clsx tailwind-merge
pnpm add lucide-react

# File system utilities
pnpm add chokidar glob fast-glob
```

---

## Step 4: Project Structure Setup

### Create Directory Structure
```bash
mkdir -p src/{main,renderer,preload}
mkdir -p src/renderer/{components,hooks,utils,types}
mkdir -p src/main/{services,utils,types}
mkdir -p public
mkdir -p resources
mkdir -p project-documents/private/{project-guides,tasks,ui}

# Create key files
touch src/main/main.ts
touch src/preload/preload.ts
touch src/renderer/main.tsx
touch src/renderer/App.tsx
touch electron.vite.config.ts
touch tsconfig.json
touch .eslintrc.js
```

### Project Structure Overview
```
rummage/
├── src/
│   ├── main/           # Electron main process
│   │   ├── services/   # File scanning, AI, database
│   │   └── utils/      # Utilities
│   ├── preload/        # Preload scripts (IPC bridge)
│   ├── renderer/       # React frontend
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom React hooks
│   │   └── utils/      # Frontend utilities
├── public/             # Static assets
├── resources/          # App icons, build resources
├── project-documents/  # AI project guides and tasks
└── dist/               # Build output
```

---

## Step 5: Configuration Files

### TypeScript Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@main/*": ["src/main/*"],
      "@renderer/*": ["src/renderer/*"],
      "@preload/*": ["src/preload/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Electron Vite Config (`electron.vite.config.ts`)
```typescript
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@main': resolve('src/main')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@preload': resolve('src/preload')
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
```

### Tailwind CSS Configuration (`src/renderer/globals.css`)
```css
@import "tailwindcss";

@theme {
  --color-primary: #2563eb;
  --color-secondary: #64748b;
  --font-display: "Inter", sans-serif;
}

/* Custom scrollbar styles */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
```

---

## Step 6: Development Workflow Setup

### VS Code Configuration (`.vscode/settings.json`)
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### VS Code Extensions (`.vscode/extensions.json`)
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "usernamehw.errorlens",
    "ms-vscode.vscode-json"
  ]
}
```

---

## Step 7: Initial File Templates

### Main Process Entry (`src/main/main.ts`)
```typescript
import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.rummage.app')
  
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```

### React App Entry (`src/renderer/App.tsx`)
```typescript
import React from 'react'
import './globals.css'

function App(): JSX.Element {
  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Rummage
        </h1>
        <p className="text-secondary text-lg">
          Local-First AI Photo & File Librarian
        </p>
        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">
            Development environment ready! 🚀
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
```

---

## Step 8: Test the Setup

### Start Development Server
```bash
# Install all dependencies
pnpm install

# Start development server
pnpm run dev
```

### Verify Everything Works
1. **Electron app should launch** with Rummage welcome screen
2. **Hot reload should work** - edit App.tsx and see changes
3. **TypeScript compilation** should work without errors
4. **Tailwind styles** should be applied correctly

### Test Build Process
```bash
# Test production build
pnpm run build

# Test packaging (optional)
pnpm run package
```

---

## Step 9: Optional: Set Up Ollama Models

### Download a Test Model
```bash
# Start Ollama service
ollama serve

# Download a small model for testing
ollama pull llama3.1:8b

# Test the model
ollama run llama3.1:8b "Suggest file organization for: IMG_001.jpg, document.pdf, setup.exe"
```

---

## Step 10: Next Steps

### You're Ready When:
- ✅ Electron app launches successfully
- ✅ React hot reload works
- ✅ TypeScript compilation is error-free  
- ✅ Tailwind CSS styles render correctly
- ✅ Build process completes without errors

### Ready for Phase 3:
Now we can proceed to **Phase 3: Detailed Task Breakdown** where we'll create granular, actionable tasks for AI developers to implement all the features defined in our specification.

---

## Troubleshooting

### Common Issues:

**Node/pnpm version conflicts:**
```bash
# Use fnm or nvm to manage Node versions
fnm use 20
pnpm install
```

**Electron build issues:**
```bash
# Clear cache and reinstall
pnpm run ai:clean
```

**SQLite compilation issues:**
```bash
# May need Python and build tools
# macOS: xcode-select --install
# Windows: Install Visual Studio Build Tools
# Linux: sudo apt-get install build-essential python3
```

**Permission issues with file scanning:**
- Ensure app has appropriate file system permissions
- Test with a small, accessible directory first

---

**Environment setup complete! Ready for development.** 🎉
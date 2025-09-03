# LLD: UI-Core → Electron Integration

**Document**: Low Level Design  
**Project**: Rummage (Electron App)  
**Objective**: Integrate @manta-templates/ui-core components into Electron/React application  
**Date**: 2025-08-31

## Executive Summary

This document outlines the technical requirements and approach for integrating the `@manta-templates/ui-core` component library into the Rummage Electron application. The ui-core library was designed to be framework-agnostic with dependency injection patterns that make cross-platform integration feasible.

## Current Architecture Analysis

### Rummage (Target Environment)
- **Framework**: Electron + Vite + React 19
- **Styling**: Tailwind CSS v4
- **Build**: electron-vite  
- **Dependencies**: `class-variance-authority`, `clsx`, `lucide-react`, `tailwind-merge`

### UI-Core (Source Library)
- **Framework**: React 18+ (peer dependency)
- **Styling**: Tailwind CSS v4, Radix Colors
- **Key Dependencies**: `framer-motion`, `three`, `@radix-ui/react-slot`
- **Architecture**: Framework-agnostic with dependency injection

## Compatibility Matrix

### ✅ **Direct Compatibility**
| Component Category | Status | Notes |
|-------------------|--------|-------|
| **Pure Components** | 100% Compatible | BaseCard, Container, BentoLayout, GridItem |
| **Theme-Aware Components** | 100% Compatible | GradientCard, CosineTerrainCard, ThreeJSCard |
| **UI Primitives** | 100% Compatible | Button, cn utility, Tailwind classes |
| **Layout Components** | 100% Compatible | All layout and grid systems |

### ⚠️ **Requires Dependency Injection**
| Component | Injection Required | Electron Solution |
|-----------|-------------------|------------------|
| **ProjectCard** | ImageComponent, LinkComponent | Standard `img`, `a` elements |
| **ArticleCard** | ImageComponent, LinkComponent | Standard `img`, `a` elements |
| **AboutCard** | ImageComponent, LinkComponent | Standard `img`, `a` elements |
| **BlogCard variants** | ImageComponent, LinkComponent | Standard `img`, `a` elements |
| **Headers/Footers** | LinkComponent | Standard `a` elements |

### ❌ **Platform-Specific (Skip Initially)**
| Component | Issue | Workaround |
|-----------|-------|-----------|
| **Content Provider System** | Next.js specific | Create Electron-specific content loader |
| **SSR/SSG Components** | Server-side only | Use client-side equivalents |

## Dependency Resolution

### Required Rummage Dependencies
```bash
# Already have ✅
- react: ^19.1.1 (ui-core needs >=18.0.0)
- tailwindcss: ^4.1.11 (matches ui-core v4.0.0)
- class-variance-authority: ^0.7.1 (exact match)
- clsx: ^2.1.1 (compatible)
- lucide-react: ^0.539.0 (compatible with ^0.507.0)
- tailwind-merge: ^3.3.1 (compatible)

# Need to add 📦
pnpm add @radix-ui/colors @radix-ui/react-slot framer-motion three gray-matter
```

### Dependency Injection Interface

Components requiring injection follow this pattern:
```typescript
interface ComponentProps {
  // Other props...
  ImageComponent?: React.ComponentType<any>;
  LinkComponent?: React.ComponentType<any>;
  imageProps?: Record<string, unknown>;
}
```

**Default Behavior**: Falls back to standard HTML elements (`img`, `a`)

## Integration Strategy

### Phase 1: Core Components (No Injection Required)
**Components Ready to Use**:
- `BaseCard`, `Container`, `BentoLayout`, `GridItem`
- `GradientCard`, `CosineTerrainCard`, `ThreeJSCard` 
- `Button`, `cn` utility
- All theme system components

**Implementation**:
```typescript
// Copy ui-core to Rummage
src/renderer/lib/ui-core/

// Import and use immediately
import { CosineTerrainCard, BaseCard, Container } from './lib/ui-core';
```

### Phase 2: Components with Injection
**Electron Adapter Pattern**:
```typescript
// src/renderer/lib/adapters/electron-ui-adapter.tsx
export const ElectronImage: React.FC<any> = (props) => <img {...props} />;
export const ElectronLink: React.FC<any> = ({ children, ...props }) => (
  <a {...props} onClick={(e) => {
    // Handle external links via Electron shell
    e.preventDefault();
    window.electronAPI?.openExternal(props.href);
  }}>
    {children}
  </a>
);

// Usage
<ProjectCard 
  ImageComponent={ElectronImage}
  LinkComponent={ElectronLink}
  content={projectData}
/>
```

### Phase 3: Content System (Custom Implementation)
**Electron Content Loader**:
```typescript
// src/renderer/lib/content/electron-content-provider.ts
class ElectronContentProvider {
  async loadContent(id: string, variant: string) {
    // Load from local files, SQLite, or bundled content
    return { frontmatter: {...}, contentHtml: "..." };
  }
}
```

## File Structure

```
src/renderer/
├── lib/
│   ├── ui-core/                    # Copy from manta-templates
│   │   ├── components/
│   │   ├── utils/
│   │   └── styles/
│   ├── adapters/
│   │   └── electron-ui-adapter.tsx # Dependency injection
│   └── content/
│       └── electron-content-provider.ts
├── components/                     # App-specific components
└── styles/
    └── globals.css                 # Import ui-core styles
```

## Build Integration

### Tailwind Configuration
Rummage's existing Tailwind v4 config should work with ui-core styles:

```css
/* src/renderer/globals.css */
@import '../lib/ui-core/styles/index.css';
/* Existing Rummage styles */
```

### Vite Configuration
No changes required - existing `@vitejs/plugin-react` handles ui-core components.

## Risk Assessment

### 🟢 Low Risk
- **Core component integration**: Well-tested dependency injection pattern
- **Styling conflicts**: Both use Tailwind v4 with compatible configurations
- **Build compatibility**: Vite handles React components naturally

### 🟡 Medium Risk  
- **Three.js bundle size**: CosineTerrainCard adds ~400KB to bundle
- **Framer Motion performance**: Animation library in Electron renderer
- **Theme system complexity**: Radix colors + CSS custom properties

### 🔴 High Risk
- **Content system coupling**: May require significant rework for Electron-specific needs
- **Memory usage**: Rich UI components in Electron renderer process

## Success Metrics

### Phase 1 (Proof of Concept)
- [ ] CosineTerrainCard renders in Rummage app
- [ ] Theme system works with Electron
- [ ] No build errors or console warnings

### Phase 2 (Full Integration)
- [ ] All injection-based components work with Electron adapters
- [ ] External link handling via Electron shell
- [ ] Image loading from local file system

### Phase 3 (Production Ready)
- [ ] Content loading from SQLite/local files
- [ ] Performance acceptable (<100ms component mount)
- [ ] Bundle size under acceptable limits

## Implementation Timeline

**Week 1**: Phase 1 - Core components + CosineTerrainCard proof of concept  
**Week 2**: Phase 2 - Dependency injection adapter + ProjectCard/ArticleCard  
**Week 3**: Phase 3 - Content system integration  

## Conclusion

The ui-core → Electron integration is **highly feasible** due to:
- Framework-agnostic design with dependency injection
- Compatible technology stack (React, Tailwind, shared utilities)
- Graceful degradation for platform-specific features

**Recommendation**: Proceed with Phase 1 implementation starting with CosineTerrainCard as proof of concept.
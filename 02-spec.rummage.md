# Rummage – Phase 2 Specification Document

**Version:** 0.2  
**Date:** 2025‑08‑12  
**Project:** `rummage`  
**Phase:** 2 - Specification  
**Based on:** Phase 1 Concept Document v0.1

---

## 1. Overview and Purpose

### Project Title
**Rummage** - Local-First AI Photo & File Librarian

### Summary
Rummage is a privacy-preserving desktop application that enables users to semantically search, organize, and manage their local files (photos, downloads, documents, external drives) using AI embeddings and intelligent automation. All processing happens locally with no cloud dependencies.

### Objectives
- **Primary Goal:** Create a functional local-first AI file management system within 30 days for OpenAI OSS Hackathon
- **User Experience:** Provide natural-language search across file collections with visual insights
- **Safety First:** All file operations are reversible with comprehensive preview and rollback capabilities  
- **Performance:** Handle 15,000+ files smoothly (based on target test case)
- **Privacy:** 100% offline operation with no external API calls required

### Target Audience
- **Everyday Organizer:** Home users wanting to find photos and clean up Downloads
- **Power Helper:** Tech-savvy family members providing trusted assistance
- **Freelancers/Professionals:** Users requiring private, offline tools for sensitive data

---

## 2. Functional Requirements

### Core Features

#### 2.1 Photo Finder & Librarian (Hero Flow)
- **Natural Language Search:** Query photos using descriptions ("vacation photos with mountains", "family dinner last summer")
- **Smart Albums:** Auto-generated collections based on content, date, location metadata
- **Rename Proposals:** AI-suggested filename improvements with batch operations
- **Calendar Heatmap:** Visual timeline showing photo activity across months/years
- **Metadata Extraction:** EXIF data parsing for date, location, camera info

#### 2.2 Downloads Triage (Secondary Flow)  
- **File Classification:** Automatic categorization by type and content
- **Duplicate Detection:** Find identical and similar files across directories
- **Sankey Previews:** Visual flow charts showing proposed reorganization plans
- **Batch Operations:** Move, rename, or delete multiple files with undo capability

#### 2.3 Semantic Search Engine
- **Text Embeddings:** Index document content using MiniLM (all-MiniLM-L6-v2)
- **Image Embeddings:** Visual content indexing using CLIP (ViT-B/32)
- **OCR Integration:** Text extraction from images and PDFs using Tesseract
- **Vector Database:** SQLite with sqlite-vec extension for similarity search

#### 2.4 Visualization & Insights
- **Treemap View:** Hierarchical directory size visualization
- **Activity Heatmap:** File creation/modification patterns over time
- **Sankey Diagrams:** File organization flow previews
- **Interactive Filters:** Date ranges, file types, folders, tags

#### 2.5 Safe Operations & Rollback
- **Read-Only Default:** All scans and analysis happen without file modifications
- **Operation Preview:** Show detailed plans before executing any changes
- **Atomic Transactions:** Group related operations for all-or-nothing execution
- **Rollback System:** Restore previous states with file history tracking

### User Stories

1. **As a user, I want to** search for "photos from my trip to Japan" **so that** I can quickly find vacation pictures without manually browsing folders.

2. **As a user, I want to** see a visual preview of how my Downloads folder would be organized **so that** I can approve the reorganization plan before it executes.

3. **As a user, I want to** undo any file operations performed by Rummage **so that** I never lose important files due to automation.

4. **As a user, I want to** see a calendar heatmap of my photo activity **so that** I can identify periods when I took many photos and find related content.

5. **As a power user, I want to** scan external drives and USB sticks **so that** I can organize and search content across all my storage devices.

---

## 3. Non-Functional Requirements

### Performance Metrics
- **File Processing:** Index 1,000 files per minute on average hardware
- **Search Response:** Return results within 500ms for typical queries
- **Memory Usage:** Stay under 2GB RAM for 15,000 file collections
- **Storage Overhead:** Metadata database under 10% of original file sizes

### Scalability
- **Target Capacity:** 15,000-50,000 files (based on user requirements)
- **Concurrent Operations:** Handle multiple background indexing tasks
- **Progressive Loading:** Stream results for large datasets

### Security Requirements
- **Local Processing:** No network requests to external services
- **File Permissions:** Respect system-level file access controls
- **Data Encryption:** Optional database encryption for sensitive collections
- **Audit Trail:** Log all file operations for transparency

### Usability Guidelines
- **Responsive Design:** UI adapts to different window sizes and screen resolutions
- **Accessibility:** Keyboard navigation, screen reader support, high contrast modes
- **Error Handling:** Clear, actionable error messages with recovery suggestions
- **Progressive Disclosure:** Advanced features hidden behind simple default interface

---

## 4. Technical Specifications

### Technology Stack

| Component | Technology | Knowledge Available |
|-----------|------------|-------------------|
| **Desktop Framework** | Electron | ✅ [Context7: /electron/electron] |
| **Frontend** | React + TypeScript | ✅ Standard knowledge |
| **Styling** | Tailwind CSS v4 | ✅ [Local guides] |
| **UI Components** | shadcn/ui | ✅ Standard knowledge |
| **Build Tool** | Vite (via electron-vite) | ✅ [Context7: /alex8088/electron-vite] |
| **Backend Runtime** | Node.js + TypeScript | ✅ Standard knowledge |
| **Database** | SQLite | ✅ Standard knowledge |
| **Vector Search** | sqlite-vec | ✅ [Context7: /asg017/sqlite-vec] |
| **Text Embeddings** | ONNX Runtime + MiniLM | ✅ [Context7: /microsoft/onnxruntime] |
| **Image Embeddings** | ONNX Runtime + CLIP | ✅ [Context7: /microsoft/onnxruntime] |
| **OCR Engine** | Tesseract.js | ⚠️ Need to research |
| **File Hashing** | xxhash or blake3 | ⚠️ Need to research |
| **Local LLM** | GPT-OSS-20B (optional) | ⚠️ Need to research |

### Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                 Frontend (React)                │
├─────────────────────────────────────────────────┤
│           Main Process (Electron)               │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │   File      │  │   Embedding  │  │ Search  │ │
│  │   Scanner   │  │   Generator  │  │ Engine  │ │
│  └─────────────┘  └──────────────┘  └─────────┘ │
├─────────────────────────────────────────────────┤
│              Database Layer                     │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │   SQLite    │  │  sqlite-vec  │  │  File   │ │
│  │  Metadata   │  │   Vectors    │  │ System  │ │
│  └─────────────┘  └──────────────┘  └─────────┘ │
└─────────────────────────────────────────────────┘
```

### Integration Requirements

#### ONNX Runtime Integration
- **Installation:** `npm install onnxruntime-node`
- **Model Loading:** Load pre-converted ONNX models for MiniLM and CLIP
- **Inference Pipeline:** Text → tokenization → embedding, Image → preprocessing → embedding
- **Performance:** Utilize CPU-optimized models, consider GPU acceleration for large batches

#### sqlite-vec Integration  
- **Installation:** `npm install sqlite-vec better-sqlite3`
- **Extension Loading:** `sqliteVec.load(db)` after database connection
- **Vector Storage:** Create `vec0` virtual tables for different content types
- **Search Queries:** KNN search using `match` operator with distance ordering

#### Electron Architecture
- **Main Process:** File system operations, database management, ML inference
- **Renderer Process:** React UI, user interactions, result display
- **IPC Communication:** Secure message passing for file operations and search requests
- **Security:** Enable context isolation, disable node integration in renderer

### Hosting and Compatibility
- **Platforms:** Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+)
- **Architecture:** x64 and ARM64 support
- **Packaging:** Electron Builder for cross-platform distributables
- **Updates:** Auto-updater integration for maintenance releases

---

## 5. Deliverables and Milestones

### Phase 3: Task Breakdown (Days 1-3)
- [ ] Detailed task creation for all components
- [ ] Development environment setup guide
- [ ] Dependency installation and configuration

### Phase 4: Core Infrastructure (Days 4-10)
- [ ] Electron application scaffold with React + TypeScript
- [ ] SQLite database schema with sqlite-vec integration
- [ ] File system scanner with metadata extraction
- [ ] ONNX Runtime integration for embeddings

### Phase 5: Search Implementation (Days 11-17)
- [ ] Text embedding pipeline (documents, filenames)
- [ ] Image embedding pipeline (photos, screenshots)
- [ ] Vector similarity search with ranking
- [ ] Search UI with filters and result display

### Phase 6: Organization Features (Days 18-24)
- [ ] File operation planning system
- [ ] Duplicate detection algorithms
- [ ] Batch operation preview and execution
- [ ] Rollback and undo functionality

### Phase 7: Visualization & Polish (Days 25-30)
- [ ] Data visualization components (treemap, heatmap, sankey)
- [ ] UI/UX refinements and accessibility
- [ ] Performance optimization and testing
- [ ] Documentation and user guides

### Wireframes/Mockups

#### Main Search Interface
```
┌─────────────────────────────────────────────────┐
│ [🔍] Natural language search...          [⚙️]   │
├─────────────────────────────────────────────────┤
│ Filters: [📁 Folders] [📅 Dates] [🏷️ Types]     │
├─────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │
│ │ 📷   │ │ 📷   │ │ 📷   │ │ 📷   │ │ 📷   │     │
│ │Photo1│ │Photo2│ │Photo3│ │Photo4│ │Photo5│     │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘     │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│ │ 📄   │ │ 📄   │ │ 📄   │ │ 📄   │              │
│ │Doc1  │ │Doc2  │ │Doc3  │ │Doc4  │              │
│ └──────┘ └──────┘ └──────┘ └──────┘              │
├─────────────────────────────────────────────────┤
│ [📊 Analytics] [🗂️ Organize] [⏮️ History]        │
└─────────────────────────────────────────────────┘
```

#### Organization Preview
```
┌─────────────────────────────────────────────────┐
│              Reorganization Plan                │
├─────────────────────────────────────────────────┤
│ Current: Downloads/                             │
│ ├── IMG_001.jpg ────────┐                      │
│ ├── IMG_002.jpg ────────┤                      │
│ ├── document.pdf ───────┼──────► Photos/       │
│ ├── setup.exe ──────────┤        ├── 2024/     │
│ └── random.txt ─────────┘        └── Vacation/ │
│                          │                     │
│ Proposed: Downloads/     ├──────► Documents/   │
│ ├── Documents/           │        └── PDFs/    │
│ ├── Photos/              │                     │
│ ├── Software/            └──────► Software/    │
│ └── Archive/                     └── Install/  │
├─────────────────────────────────────────────────┤
│ [✅ Apply Changes] [❌ Cancel] [👁️ Preview]      │
└─────────────────────────────────────────────────┘
```

---

## 6. Risk Management

### Constraints
- **Time Limit:** 30-day hackathon deadline requires aggressive prioritization
- **Single Developer:** Limited bandwidth requires careful scope management
- **Cross-Platform:** Supporting multiple OS increases complexity
- **Local Processing:** No cloud services means all AI must run efficiently locally

### Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|-------------------|
| **ONNX Runtime Performance** | Medium | High | Benchmark early, have CPU fallback, consider smaller models |
| **Electron Bundle Size** | Low | Medium | Use tree-shaking, external model loading, compression |
| **File Permission Issues** | Medium | Medium | Graceful error handling, user permission requests |
| **Memory Usage with Large Collections** | High | High | Streaming processing, pagination, background indexing |
| **SQLite Extension Compatibility** | Low | High | Test on all platforms early, have pure JS fallback |
| **OCR Performance** | Medium | Medium | Optional feature, background processing, progress indicators |

### Mitigation Strategies
- **MVP-First Approach:** Core search functionality before advanced features
- **Progressive Enhancement:** Basic file browsing → semantic search → AI organization
- **Fallback Systems:** Pure text search if embeddings fail, manual operations if AI fails
- **Extensive Testing:** Daily builds across target platforms
- **User Feedback:** Early alpha testing with target user scenarios

---

## 7. Success Criteria

### Minimum Viable Product (MVP)
- [ ] Scan and index local photo and document collections
- [ ] Natural language search returning relevant results
- [ ] Basic file organization with preview and undo
- [ ] Cross-platform desktop application package

### Stretch Goals
- [ ] Real-time search suggestions and auto-complete
- [ ] Smart album generation based on content similarity
- [ ] Voice search and command interface
- [ ] Integration with external drives and cloud storage mounts
- [ ] Advanced visualization dashboards
- [ ] Few-shot tagging and custom categories

### Demo Scenarios
1. **Photo Discovery:** "Find photos of dogs from last summer" returns accurate results
2. **Downloads Cleanup:** Automatically categorize and organize 1000+ mixed downloads
3. **Document Search:** Find specific contracts or receipts using content descriptions
4. **Duplicate Removal:** Identify and safely remove duplicate files across directories
5. **Historical Analysis:** Show file activity patterns and storage usage trends


## 8. Additional Notes

Great questions! Let me address each one:

## Package Manager: npm vs pnpm

**Yes, we can absolutely use pnpm!** In fact, pnpm is often better for Electron projects because:
- Faster installs and smaller node_modules
- Better dependency deduplication
- Strict mode prevents phantom dependencies
- Works seamlessly with all npm-compatible tools

The ai-project-guide scripts should work with pnpm since they typically use `npm_config_*` environment variables that pnpm respects.

## AI Project Guide + Manta Templates

**Excellent idea!** We should definitely set this up. The ai-project-guide mentioned having scripts in `snippets/npm-scripts.ai-support.json` that should be added to package.json. This would give us:
- Standardized AI-friendly development scripts
- Consistent project structure
- Better integration with the workflow we're already using

## GPT-OSS-20B Model Loading

For the local LLM component, we have several options:Perfect! Now let me research the hashing libraries:Now I have enough information to answer all your questions! Here's the comprehensive breakdown:

## 📦 Package Manager: **Yes, use pnpm!**

**Absolutely use pnpm** instead of npm. Benefits for our Electron project:
- **Faster installs** (2-3x speed improvement)
- **Smaller disk usage** with hard linking
- **Strict mode** prevents phantom dependencies
- **Better monorepo support** if we expand later
- **Compatible** with all npm packages and scripts

## 🤖 AI Project Guide + Manta Templates Integration

This is a **great idea**! Based on the guides, we should:
1. Add the scripts from `snippets/npm-scripts.ai-support.json` to our package.json
2. Set up the standardized AI-friendly project structure
3. Use the consistent workflow we're already following

This will give us:
- Standardized development scripts optimized for AI collaboration
- Better task delegation to junior AIs
- Consistent project structure across tools

## 🧠 GPT-OSS-20B Model Loading Options

Based on my research, here are the **best options for local LLM integration**:

### **Option 1: Ollama (Recommended)**
- **Installation:** `npm install ollama` 
- **Benefits:** Easy integration, automatic model management, great Node.js support
- **Usage:**
  ```javascript
  import ollama from 'ollama'
  const response = await ollama.chat({
    model: 'llama3.1',  // or similar 20B model
    messages: [{ role: 'user', content: 'Plan file organization...' }]
  })
  ```

### **Option 2: Alternative Models**
Since GPT-OSS-20B is hypothetical, we could use:
- **Llama 3.1 8B/70B** via Ollama (proven, fast)
- **Qwen 2.5** models (excellent for planning tasks)
- **DeepSeek-Coder** (great for structured output)

### **Integration Strategy:**
- Optional feature that enhances the core functionality
- Fallback to simpler rule-based organization if LLM unavailable
- Progressive enhancement approach

## 🔐 File Hashing: xxhash vs BLAKE3

Based on research, here are your **excellent options**:

### **hash-wasm (Recommended for us)**
```bash
pnpm install hash-wasm
```
**Why it's perfect:**
- **Includes both** xxhash AND BLAKE3
- **WebAssembly-based** = extremely fast
- **177 dependent projects** = well-tested
- **One package** handles all our hashing needs

```javascript
import { xxhash3, blake3 } from 'hash-wasm';

// Fast non-cryptographic hashing for deduplication
const quickHash = await xxhash3('file content');

// Secure hashing for integrity verification  
const secureHash = await blake3('file content');
```

### **When to use which:**
- **xxhash3:** Super fast, for duplicate detection and file identification
- **BLAKE3:** Cryptographically secure, for file integrity and change detection

### **Alternative: Individual packages**
- `npm install xxhash` (if you want just xxhash)
- `npm install blake3` (if you want just BLAKE3)

But **hash-wasm gives us both plus 20+ other algorithms** in one optimized package.

---

## 📋 Updated Technical Stack Summary

| Component | Technology | Status | Package |
|-----------|------------|--------|---------|
| Package Manager | **pnpm** | ✅ Ready | `pnpm` |
| Hashing | **hash-wasm** | ✅ Ready | `hash-wasm` |
| Local LLM | **Ollama** | ✅ Ready | `ollama` |
| AI Project Scripts | **AI Guide Integration** | ✅ Ready | Copy from snippets |

## 🎯 Recommendations

1. **Start with pnpm** - Set up the project with `pnpm init`
2. **Integrate AI project scripts** early for better development workflow  
3. **Use hash-wasm** for both xxhash3 (speed) and BLAKE3 (security)
4. **Add Ollama** as an optional enhancement, not a core dependency
5. **Test locally** with smaller models first (Llama 3.1 8B)

This gives us a **modern, fast, and AI-friendly development setup** that's perfect for the hackathon timeline!

Should we proceed to **Phase 3: Detailed Task Breakdown** with this updated technical stack?
---

**End of Specification Document**  

# High-Level Design: Rummage

## System Overview
Rummage is a privacy-preserving desktop application for semantic file management and organization. The system enables natural language search across local files (photos, documents, downloads) using AI embeddings, provides visual insights through data visualizations, and offers safe, reversible file operations—all running completely offline.

### Key Architectural Decisions
- **Local-First Architecture**: All processing happens locally with no cloud dependencies
- **Electron Desktop App**: Cross-platform native experience with optional PWA companion
- **Vector Search**: SQLite with sqlite-vec for efficient similarity search
- **ONNX Runtime**: Efficient local AI inference for embeddings
- **Safety-First Operations**: Read-only default with preview and rollback capabilities

## Major Components

### Frontend Layer
- **Electron Renderer Process**: React + TypeScript UI
- **UI Framework**: Minimal UI approach - React + TypeScript + Radix UI primitives
  - Note: Keeping UI extremely minimal for potential manta-templates integration
  - shadcn/ui provides accessible components built on Radix primitives
  - Radix UI offers unstyled, accessible component primitives perfect for custom styling
- **Visualization Engine**: D3.js/Recharts for treemaps, heatmaps, Sankey diagrams
- **State Management**: React Context (minimal approach)

### Backend Services (Main Process)
- **File Scanner Service**: Recursive directory traversal with metadata extraction
- **Embedding Generator**: ONNX Runtime with MiniLM (text) and CLIP (images)
- **Search Engine**: Vector similarity search with ranking and filtering
- **Operation Planner**: File operation planning with preview and rollback
- **OCR Service**: Tesseract.js for text extraction from images/PDFs

### Data Layer
- **SQLite Database**: File metadata, paths, dates, EXIF data
- **Vector Store**: sqlite-vec extension for embedding storage and KNN search
- **Hash Store**: xxhash3/BLAKE3 for duplicate detection
- **Transaction Log**: Operation history for rollback capability

### AI Components (OpenAI Hackathon Focus)
**Core AI Models (Local/OSS):**
- **Text Embeddings**: MiniLM (all-MiniLM-L6-v2) via ONNX Runtime
  - Semantic understanding of document content and filenames
  - Natural language query processing
- **Image Embeddings**: CLIP (ViT-B/32) via ONNX Runtime  
  - Visual content understanding for photos
  - Image similarity search
- **OCR Engine**: Tesseract.js
  - Text extraction from images and PDFs
  - Enables searchability of scanned documents

**Optional AI Enhancement:**
- **Local LLM**: Ollama with OSS models (Llama 3.1, Qwen 2.5, etc.)
  - Intelligent file organization suggestions
  - Natural language command interpretation
  - Advanced categorization and tagging

**AI-Powered Features:**
- Semantic search across all file types
- Content-based duplicate detection
- Smart album generation from photos
- Intelligent file organization proposals
- Natural language query understanding

### Optional Components
- **Web Server**: Express.js for PWA/mobile access (optional)

## Data Flow

### Indexing Pipeline
1. File Scanner discovers files in target directories
2. Metadata Extractor pulls EXIF, filesystem metadata
3. Hash Generator creates fingerprints for duplicate detection
4. OCR Engine extracts text from images/PDFs (if applicable)
5. Embedding Generator creates vectors for content
6. Database stores metadata and vectors for search

### Search Flow
1. User enters natural language query
2. Query processor generates embedding
3. Vector search finds similar content
4. Results ranked by similarity and filters
5. UI displays results with previews

### Organization Flow
1. User selects files/folders for organization
2. Planner generates organization proposal
3. Visualization shows before/after state
4. User reviews and approves plan
5. Executor performs atomic operations
6. Transaction log enables rollback

## Infrastructure Requirements

### Performance Targets
- Handle 15,000+ files smoothly
- Index 1,000 files/minute on average hardware
- Search response < 500ms
- Memory usage < 2GB for typical collections

### Storage Requirements
- Metadata database ~10% of file collection size
- Embedding vectors ~1KB per file
- Transaction logs for operation history
- Model files (~100-200MB for ONNX models)

### Security Considerations
- No network requests to external services
- Respect system file permissions
- Optional database encryption
- Audit trail for all operations
- Sandboxed file system access

### Platform Support
- **Primary**: macOS (10.15+), Windows (10+), Linux (Ubuntu 18.04+)
- **Architecture**: x64 and ARM64
- **Distribution**: Electron Builder packages
- **Updates**: Auto-updater for maintenance releases

## Integration Points

### File System Integration
- Native file system APIs for scanning
- Watch for file system changes
- Support for external drives/USB
- Symbolic link handling

### Model Integration
- ONNX Runtime for inference
- Pre-converted ONNX models
- Optional GPU acceleration
- Model caching and loading

### Optional LLM Integration
- Ollama API for local models
- Fallback to rule-based organization
- Progressive enhancement approach

## Component Interfaces

### IPC Communication
- Main ↔ Renderer: Secure message passing
- Structured command/response protocol
- Stream support for large datasets
- Error propagation and handling

### Database Interfaces
- Repository pattern for data access
- Migration system for schema updates
- Connection pooling for performance

### Plugin Architecture (Future)
- Extension points for custom scanners
- Custom embedding models
- Additional visualization types
- External tool integration
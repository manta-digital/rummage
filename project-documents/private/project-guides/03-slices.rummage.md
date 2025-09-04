# Slice Plan: Rummage

**Project:** Rummage - Local-First AI Photo & File Librarian  
**Focus:** OpenAI OSS Hackathon MVP (30-day timeline)  
**Date:** 2025-08-29  
**Priority:** Core AI-powered features with minimal UI  
**Methodology:** Test-Driven Development (TDD)

## TDD Integration Strategy

### Test-First Development Approach
- **Write tests before implementation** for all business logic
- **Use test doubles** (mocks/stubs) for external dependencies
- **Red-Green-Refactor cycle**: Test fails → Make it pass → Improve code
- **Test categories**:
  - Unit tests: Business logic, utilities, services
  - Integration tests: IPC communication, database operations
  - Component tests: React components with Testing Library
  - E2E tests: Critical user workflows (minimal for MVP)

### Testing Infrastructure
- **Vitest**: Already configured for unit/integration tests
- **@testing-library/react**: Component testing
- **@vitest/ui**: Visual test runner
- **Mock implementations**: File system, database, ONNX models

## Foundation Work

### Phase 0: Testing Infrastructure Setup
1. [ ] **Test Framework Configuration** - Enhanced Vitest setup with coverage
   - Configure test environments (node for main, jsdom for renderer)
   - Set up test doubles for Electron IPC
   - Create test fixtures for file system operations
   - Dependencies: None
   - Critical for: TDD implementation

### Phase 1: Project Setup & Core Infrastructure  
1. [x] **Electron + React Setup** - Initialize Electron app with React, TypeScript, Vite build
   - Dependencies: None
   - Critical for: All subsequent work
   - Status: COMPLETED (basic skeleton running)
   
2. [ ] **Database Layer** - SQLite setup with sqlite-vec extension  
   - Dependencies: [Electron setup]
   - Critical for: All data storage and search functionality
   
3. [ ] **IPC Architecture** - Main/Renderer process communication structure
   - Dependencies: [Electron setup]
   - Critical for: All backend services integration

4. [ ] **Minimal UI Shell** - Basic layout with React + Radix UI primitives
   - Dependencies: [Electron setup]
   - Note: Keep extremely minimal for manta-templates compatibility
   
### Phase 2: AI Infrastructure
5. [ ] **ONNX Runtime Integration** - Load and run MiniLM and CLIP models
   - Dependencies: [Electron setup]
   - Critical for: All AI-powered features
   
6. [ ] **Embedding Pipeline** - Text and image embedding generation service
   - Dependencies: [ONNX Runtime, Database]
   - Critical for: Semantic search functionality

## Feature Slices (in implementation order)

### Slice 1: File Scanner & Indexer
**User Value:** Discover and catalog files across local directories  
**Success Criteria:** Can scan directories, extract metadata, store in database  
**Dependencies:** [All Foundation Work]  
**Interfaces:** File metadata API, scan progress events  
**Risk Level:** Low  
**AI Components:** None (preparation for AI features)  
**TDD Approach:**
- Test file discovery with mock file system
- Test metadata extraction with sample files
- Test database persistence with in-memory SQLite
- Test progress reporting with event listeners

### Slice 2: Semantic Photo Search  
**User Value:** Find photos using natural language descriptions  
**Success Criteria:** Search "beach sunset" returns relevant photos  
**Dependencies:** [Slice 1, AI Infrastructure]  
**Interfaces:** Search API, embedding storage  
**Risk Level:** Medium (first AI integration)  
**AI Components:** CLIP for image embeddings, MiniLM for query processing  
**TDD Approach:**
- Test embedding generation with mock ONNX models
- Test vector similarity with known embeddings
- Test search ranking with controlled datasets
- Test query parsing and normalization

### Slice 3: Smart Duplicate Detection
**User Value:** Find and manage duplicate files intelligently  
**Success Criteria:** Identify exact and similar duplicates, preview removal  
**Dependencies:** [Slice 1]  
**Interfaces:** Duplicate detection API, hash comparison  
**Risk Level:** Low  
**AI Components:** Content-based similarity via embeddings  
**TDD Approach:**
- Test hash generation with sample files
- Test exact duplicate detection
- Test similarity scoring algorithms
- Test duplicate grouping logic

### Slice 4: Downloads Organization
**User Value:** Automatically categorize and organize Downloads folder  
**Success Criteria:** Generate organization plan with Sankey preview  
**Dependencies:** [Slice 1, Slice 2]  
**Interfaces:** Organization planner API, file operations  
**Risk Level:** Medium (safe file operations)  
**AI Components:** MiniLM for content categorization  
**TDD Approach:**
- Test categorization rules with known file types
- Test organization plan generation
- Test operation preview creation
- Test rollback mechanism with transaction logs

### Slice 5: Visual Insights Dashboard
**User Value:** See file activity patterns and storage usage  
**Success Criteria:** Display heatmap, treemap, basic analytics  
**Dependencies:** [Slice 1]  
**Interfaces:** Visualization data API  
**Risk Level:** Low  
**AI Components:** None (data visualization)  
**TDD Approach:**
- Test data aggregation functions
- Test visualization data transforms
- Test component rendering with mock data
- Test interactive filtering logic

## Integration Work

1. [ ] **Performance Optimization** - Batch processing, caching, lazy loading
2. [ ] **Error Recovery** - Graceful handling of large collections, corrupted files
3. [ ] **Cross-Platform Testing** - Verify Windows, macOS, Linux compatibility
4. [ ] **Package & Distribution** - Electron Builder configuration for all platforms

## Deferred Features (Not in MVP Scope)

### Stretch Goals (Post-Hackathon)
- Voice search interface
- Few-shot tagging and custom categories  
- Old drive analysis and archival
- Advanced OCR with language packs
- Local LLM integration (Ollama)
- PWA/Mobile companion app
- Real-time file system watching
- Cloud storage mount support
- Plugin architecture

### Advanced AI Features (Future)
- GPT-OSS-20B or similar for organization planning
- Multi-modal search (text + image combined)
- Auto-tagging with custom trained models
- Facial recognition for photo organization

## TDD Development Workflow

### For Each Slice Implementation

#### 1. Design Phase (Before Writing Any Code)
- Define interfaces and contracts
- Write interface tests that describe expected behavior
- Create test fixtures and sample data
- Document edge cases and error conditions

#### 2. Red Phase (Tests First)
```typescript
// Example: File Scanner Tests (written first)
describe('FileScanner', () => {
  it('should discover all files in directory', async () => {
    const mockFS = createMockFileSystem([...])
    const scanner = new FileScanner(mockFS)
    const files = await scanner.scan('/test')
    expect(files).toHaveLength(3)
  })
  
  it('should extract metadata from files', async () => {
    // Test fails - implementation doesn't exist yet
  })
})
```

#### 3. Green Phase (Minimal Implementation)
- Write just enough code to make tests pass
- Focus on correctness, not optimization
- Use simple, obvious implementations

#### 4. Refactor Phase (Improve Code Quality)
- Optimize performance if needed
- Extract common patterns
- Improve naming and structure
- Tests must still pass!

### Test Organization Structure
```
src/
├── main/
│   ├── services/
│   │   ├── FileScanner.ts
│   │   └── FileScanner.test.ts    # Unit tests
├── renderer/
│   ├── components/
│   │   ├── SearchBar.tsx
│   │   └── SearchBar.test.tsx     # Component tests
└── tests/
    ├── fixtures/               # Test data
    ├── mocks/                 # Mock implementations
    └── integration/           # Cross-boundary tests
```

### Testing Best Practices for Rummage

1. **Mock External Dependencies**
   - File system operations
   - Database connections
   - ONNX model loading
   - IPC communication

2. **Use Test Fixtures**
   - Sample images for CLIP testing
   - Sample documents for text embedding
   - Known file structures for scanner testing

3. **Test Data Builders**
   ```typescript
   const testFile = fileBuilder()
     .withName('vacation.jpg')
     .withSize(1024000)
     .withMimeType('image/jpeg')
     .build()
   ```

4. **Integration Test Scenarios**
   - "User searches for photos" - full flow test
   - "System indexes new directory" - end-to-end test
   - "Duplicate detection on 100 files" - performance test

## Implementation Notes

### Slice Sizing Strategy
Each slice is designed to be completed in 3-5 days, allowing for:
- 1 day for design and task breakdown
- 2-3 days for implementation
- 1 day for testing and integration

### Risk Mitigation
- **Slice 2 (Semantic Search)**: First AI integration - allow extra time for model loading/performance issues
- **Slice 4 (Downloads Org)**: File operations - implement comprehensive preview and rollback first

### Dependencies Management
- Foundation work must be 100% complete before starting feature slices
- Slices 1-3 can potentially be parallelized after foundation
- Slice 4 depends on learnings from Slice 2 (AI integration)
- Slice 5 is independent and can be moved if needed

### Technical Decisions
- **Minimal UI**: Using Radix UI primitives to stay compatible with manta-templates
- **AI Focus**: Prioritizing AI-powered features for hackathon impact
- **Safety First**: All file operations are reversible with preview
- **Local Only**: No network dependencies, all processing offline

## Success Metrics for MVP

### Core Functionality
- [ ] Can index 15,000+ files without performance issues
- [ ] Semantic search returns relevant results in < 500ms
- [ ] Duplicate detection accuracy > 95%
- [ ] File organization preview clearly shows proposed changes
- [ ] All operations are reversible

### AI Integration  
- [ ] ONNX models load and run efficiently
- [ ] Natural language queries work intuitively
- [ ] Image similarity search is accurate
- [ ] Content categorization makes logical sense

### User Experience
- [ ] Application starts in < 5 seconds
- [ ] UI is responsive during indexing
- [ ] Clear progress indicators for long operations
- [ ] Error messages are helpful and actionable

## Next Steps

1. **Immediate**: Complete foundation work (traditional task breakdown)
2. **Week 1-2**: Implement Slices 1-2 (core functionality + first AI)
3. **Week 2-3**: Implement Slices 3-4 (practical features)
4. **Week 3-4**: Implement Slice 5 + integration work
5. **Final Days**: Polish, testing, documentation for submission

This plan delivers a focused MVP showcasing AI-powered local file management while maintaining flexibility for the manta-templates UI system.
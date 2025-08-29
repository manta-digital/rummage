# Changelog

All notable changes to the AI Project Guide system will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

## [0.7.0] - 2025-08-18

### Added
- **Slice-based development methodology**: Complete overhaul of project workflow to use vertical slices
  - **Phase 3: High-Level Design & Slice Planning** - Break projects into manageable vertical slices
  - **Phase 4: Slice Design (Low-Level Design)** - Create detailed technical designs for individual slices
  - **Phase 5: Slice Task Breakdown** - Convert slice designs into granular tasks with context headers
  - **Phase 6: Task Enhancement and Expansion** - Enhance slice tasks for reliable AI execution
  - **Phase 7: Slice Execution** - Implement individual slices with proper context management
  - **Phase 8: Slice Integration & Iteration** - Integrate completed slices and plan next iterations
- **New comprehensive guides**:
  - `guide.ai-project.03-slice-planning.md` - Complete guide for breaking projects into slices
  - `guide.ai-project.04-slice-design.md` - Detailed slice design methodology with templates
  - `guide.ai-project.06-task-expansion.md` - Updated task expansion for slice-based work
- **Legacy project migration**: 
  - `guide.ai-project.91-legacy-task-migration.md` - Systematic migration from legacy to slice-based approach
  - Comprehensive migration prompt for converting existing projects
- **Enhanced context management**:
  - YAML front matter for all slice task files with project state, dependencies, and metadata
  - Context summary sections to enable AI restart capability
  - Slice-specific file organization with `nn-slice.{slice-name}.md` naming convention
- **Improved file organization**:
  - `private/slices/` directory for slice-specific low-level designs
  - Sequential indexing for all slice and task files (01, 02, 03, etc.)
  - Clear separation between foundation work, feature slices, and integration work

### Changed
- **Project workflow**: Shifted from monolithic project approach to slice-based development
  - Projects now treated as "collections of slices" rather than single large entities
  - Each slice follows its own design → task → implementation → integration cycle
  - Better context management and reduced AI hallucination through smaller, focused work units
- **Guide numbering and organization**:
  - Moved code review guide to `guide.ai-project.90-code-review.md` (supplemental guides 90+)
  - Updated task expansion guide to Phase 6: `guide.ai-project.06-task-expansion.md`
  - Established clear distinction between core workflow phases (1-8) and supplemental guides (90+)
- **Prompt templates**: Complete overhaul of all prompt templates for slice-based workflow
  - New slice-specific prompts for planning, design, task breakdown, and implementation
  - Updated context refresh prompts to work with slice-based projects
  - Legacy prompts moved to deprecated section with migration guidance
- **Task file structure**:
  - Enhanced with YAML front matter including slice metadata and project state
  - Context summary sections for better AI restart capability
  - Updated naming convention: `nn-tasks.{slice-name}.md`
- **Documentation structure**:
  - Updated README.md with complete phase mapping table (1-8)
  - Added supplemental guides section and development approach guidance
  - Clarified when to use slice-based vs traditional approaches

### Fixed
- **Context management issues**: Slice-based approach significantly reduces "lost in the middle" problems
- **Guide references**: Updated all cross-references to use correct guide numbering
- **File naming consistency**: Established clear patterns for slice designs and task files

### Technical Details
- **Backward compatibility**: Legacy project support maintained with migration path
- **Agent integration**: Updated for better compatibility with Claude Code, Cline, and other AI agents
- **Scalability**: Slice-based approach enables future parallelization of development work
- **Quality assurance**: Enhanced task granularity reduces AI hallucination and improves success rates

### Migration Notes
- Existing projects can be migrated using the legacy migration guide
- Traditional approach still available for simple projects and single features
- All legacy prompts preserved in deprecated sections

## [0.6.0] - 2025-08-15

### Added
- **Claude Code support**: Added `claude` option to `setup-ide` script to generate `CLAUDE.md` file
  - Compiles all rules into single Claude-friendly format
  - Proper heading hierarchy (H1 → H2 → H3 → H4)
  - General Development Rules listed first, other categories alphabetically
  - Automatic frontmatter stripping and heading level adjustment

### Changed
- **Directory structure clarification**: Resolved ambiguity between directory concepts:
  - `project-documents/private/` for regular development (template instances)
  - `project-artifacts/` for monorepo template development
  - Deprecated `{template}/examples/our-project/` with migration path
- **Feature file naming convention**: Updated from `{feature}-feature.md` to `nn-feature.{feature}.md` format
- **Task file naming convention**: Updated from `{section}-tasks-phase-4.md` to `nn-tasks-{section}.md` format
  - Added sequential index prefix (01, 02, 03, etc.) for better organization
  - Removed confusing '-phase-4' suffix from task file names
  - Updated all prompt templates and guides to use new naming pattern
  - Streamlined and updated system prompts.
- **File naming documentation**: Updated `file-naming-conventions.md` with new task file patterns and documented legacy formats
- **Documentation updates**: Updated README.md to include Claude setup instructions

## [0.5.2] - 2025-07-26

### Added
- **Project document phase numbering**: Implemented `XX-name.{project}.md` naming convention for project-specific documents
- **Consistent ordering**: Project documents now follow the same phase-based ordering as guides
- **Setup Script**: setup scripts for Windsurf and Cursor rules/ and agents/.

### Changed
- **Project document names**: Updated project-specific document naming to use phase numbers:
  - `concept.{project}.md` → `01-concept.{project}.md`
  - `spec.{project}.md` → `02-spec.{project}.md`
  - `notes.{project}.md` → `03-notes.{project}.md`
- **Guide output locations**: Updated all guides to reference new phase-numbered document names
- **Directory structure**: Updated structure diagrams to reflect new naming convention

## [0.5.1] - 2025-07-24

### Added
- **Phase numbering system**: Implemented `guide.ai-project.XX-name.md` naming convention for all project guides
- **Clear phase progression**: Files now alphabetize correctly while showing clear phase order (00-process, 01-concept, 02-spec, 04-task-expansion, 05-code-review)

### Changed
- **Guide file names**: Renamed all project guides to use phase numbers:
- **Prompt file names**: Renamed prompt files for better clarity:
  - `template.ai-project.prompts.md` → `prompt.ai-project.system.md`
  - `guide.ai-project.05-code-review-crawler.md` → `prompt.code-review-crawler.md`
  - `guide.ai-project.process.md` → `guide.ai-project.00-process.md`
  - `guide.ai-project.concept.md` → `guide.ai-project.01-concept.md`
  - `guide.ai-project.spec.md` → `guide.ai-project.02-spec.md`
  - `guide.ai-project.task-expansion.md` → `guide.ai-project.04-task-expansion.md`
  - `guide.code-review.ai.md` → `guide.ai-project.05-code-review.md`
  - `guide.code-review-2.ai.md` → `guide.ai-project.05-code-review-2.md` (consolidated into main code review guide)
  - `guide.code-review-crawler.md` → `prompt.code-review-crawler.md`
- **Internal references**: Updated all cross-references between guides to use new naming convention
- **Template prompts**: Updated all prompt templates to reference new guide names
- **Rules consistency**: Updated `rules/general.md` to use `private/` instead of `our-project/`

### Removed
- **`project-guides/coderules.md`**: Completely removed deprecated file, replaced by `project-guides/rules/general.md`
- **`project-guides/guide.ai-project.05-code-review-2.md`**: Consolidated duplicate content into main code review guide

### Fixed
- **File organization**: All guides now follow consistent phase-based naming
- **Cross-references**: All internal links and dependencies updated to new structure

## [0.5.0] - 2025-07-24

### Added
- **New modular rules system**: Replaced monolithic `coderules.md` with organized `project-guides/rules/` directory
- **Agent configurations**: Added `project-guides/agents/` directory for IDE-specific agent configurations
- **IDE integration guide**: Added instructions for copying rules and agents to `.cursor/` and `.windsurf/` directories
- **Migration documentation**: Added comprehensive migration guide from `our-project/` to `private/` structure

### Changed
- **Directory structure**: Migrated from `our-project/` to `private/` throughout all guides
- **File organization**: Established flat structure under `private/` with dedicated folders for tasks, code-reviews, maintenance, ui
- **Task file naming**: Updated to consistent hyphen-separated naming (`{section}-tasks.md`)
- **Code review paths**: Updated all review guides to use `private/code-reviews/`
- **Template prompts**: Updated all prompt templates to reference new `private/` structure

### Deprecated
- **`project-guides/coderules.md`**: Marked as deprecated, replaced by modular `rules/` system
- **`our-project/` directory**: Replaced by `private/` directory (with migration path provided)

### Fixed
- **Directory structure**: Clarified distinction between `private/` (regular development) and deprecated `our-project/` structure
- **File naming consistency**: Updated examples in `file-naming-conventions.md` to use `private/`
- **Link references**: Fixed broken links in `project-guides/readme.md`

### Technical Details
- Updated 13 files to use new `private/` structure
- Added migration instructions for existing projects
- Maintained backward compatibility for legacy `coderules.md`
- Established clear separation between shared methodology and project-specific work

## [0.4.0] - Previous Release

### Added
- Initial AI project guide system
- 6-phase project methodology
- Tool-specific guides and framework documentation
- Code review processes and templates
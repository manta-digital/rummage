# Directory Structure — 2025-05-01 update  
_This file is the canonical contract for where every guide, snippet, and asset lives._

```
project-documents/
├── project-guides/          # project-process & meta-methodology
│   └── …                    # (shared subtree)
├── framework-guides/        # app-level runtimes & platforms
│   └── nextjs/ …
├── tool-guides/             # importable libraries / UI kits
│   └── scichart/ …
├── api-guides/              # external data / service endpoints
│   └── usgs/ …
├── domain-guides/           # cross-cutting subject knowledge
│   └── hydrology/ …
├── snippets/                # language-agnostic code or prompt templates
│   └── prompt.ai-project.system.md   # process-wide prompts library
├── private/                 # project-specific customization, 1 project 1 repo.
│   ├── code-reviews/        # review docs & follow-up actions
│   ├── features/            # feature definitions & specifications
│   ├── maintenance/         # maintenance tasks & outcomes
│   ├── project-guides/      # project-specific guide customizations
│   │   ├── 01-concept.{project}.md # project concept documents
│   │   ├── 02-spec.{project}.md    # project specifications
│   │   └── 03-notes.{project}.md   # project-specific notes
│   ├── tasks/               # task breakdowns & phase documents
│   └── ui/                  # UI tasks & resources
│       └── screenshots/     # mock-ups, design references└── README.md                # folder-local orientation (this file’s sibling)
```
> **Note:**
> _If_ a prompt template is tightly coupled to your AI-process phases (as with prompt.ai-project.system.md), keep it in **project-guides/**; ad-hoc language snippets still go to **snippets/**
> 
> **Directory Structure by Use Case (IMPORTANT):**   
> 
> **1. Regular Development** (standard template instance development):
> - Use `project-documents/private/` for all project-specific files
> - This is the standard path described throughout the AI Project Guide
> 
> **2. Monorepo Template Development** (working on templates themselves or other monorepo sections):
> - Use `project-artifacts/` for project-specific files that would normally go in `private/`
> - This maintains compatibility with existing tooling while working on the monorepo structure itself
> 
> **3. Legacy `{template}/examples/our-project/`**:
> - **DEPRECATED**: No longer used
> - Migrate any existing content to `project-artifacts/` for monorepo work

## Zero-ambiguity decision matrix

| Ask in order | Folder |
|--------------|--------|
| Process / methodology? | `project-guides/` |
| Owns whole app lifecycle? | `framework-guides/` |
| External network API? | `api-guides/` |
| Importable library? | `tool-guides/` |
| Broad subject knowledge? | `domain-guides/` |

> **One-path rule:** a doc lives in exactly one folder.  
> **Metadata override:** if a file has YAML front-matter key `layer`, that wins if it contradicts the path.

#### Attachment policy
Images will be moved to the `z-attachments` folder in Obsidian.  Obsidian will rewrite links automatically when you move files.
#### Templates & snippets
* **Prompt/code templates** that are part of the **process** live in  
  `project-guides/` (e.g., `prompt.ai-project.system.md`).  
* Ad-hoc language or tooling snippets that don’t belong to a phase go in `snippets/`.
### Naming reminder
Follow the pattern `[doc-type].[subject].[info].md`. See `file-naming-conventions.md` for full details.


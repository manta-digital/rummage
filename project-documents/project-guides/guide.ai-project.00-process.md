---
layer: process
phase: 0               # 0 = meta-guide that defines all phases
phaseName: meta
guideRole: primary
audience: [human, ai]
description: Master process guide describing roles and the slice-based workflow.
dependsOn: []
---

#### Overview
This document describes our AI project planning methodology and structure. Projects are broken into vertical slices that can be designed and implemented independently, reducing complexity and context management issues.

#### Roles
- Project Manager & Tech Lead: Typically a human. Oversees overall project direction, coordinates tasks, and makes key decisions.
- Technical Fellow (AI) : A "senior" AI model (e.g., GPT o3, GPT-4.5) providing high-level
  strategy, architecture ideas, brainstorming support.
- Researcher (AI): A thinking or deep research AI (o3, o1 pro, Sonnet 4 Thinking, Grok3).
- Senior AI (Agents): Specialized AI agents or tools (e.g., Claude Code,
  Windsurf Cascade, Cursor, Cline) capable of advanced tasks—code generation, advanced logic, or system design.
- Junior AI: Examples: ChatGPT o4-mini-high, 4-o, Claude 4 Sonnet, Grok3, DeepSeek (US-based). These can still be top-tier AIs in terms of capabilities, but in this context they do not make product decisions and are managed by the agents (Senior AI or Project Manager).
- Code Reviewer: (Human or AI)  
  Reviews code and documents findings in accordance with the AI Code Review Guide.

Note: Multiple roles can be combined in a single contributor (human or AI), and there can also be multiple contributors in a given role. The Project Manager will assign roles.

---
#### Project Phases
Each project phase must be approved by Project Manager & Tech Lead before moving on to the next phase. When working on project phases, ensure you have all required information first. If in doubt, request and obtain the required information from the Project Manager before proceeding. Do not guess or make assumptions.

##### Slice vs Feature 
**Note:** Most non-trivial projects follow the slice-based approach (Phases 1-3, then slice execution). Simple projects or individual features may use the traditional full-project approach.  If in doubt, use this criteria to determine whether something should be a feature or a slice:

**Slices** are vertical cuts through your project architecture - complete user workflows that deliver independent value. They include all layers needed for that functionality: UI, business logic, data storage, testing. A slice can be demonstrated and used on its own.

**Features** are horizontal additions or modifications to existing functionality. They typically extend or modify existing slices rather than creating new end-to-end workflows.

For an app example:
- **Slice**: "User Authentication" - complete login/logout workflow from UI to database
- **Feature**: "Remember me checkbox" - extends the existing authentication slice

##### Phases Detail
1. **Phase 1: Concept**
   - Project Manager provides an initial product concept in plain language.
   - Collaborate with the Technical Fellow (AI) to refine the vision, identify challenges, and define the core product concept.
   - Outcome: _A short doc describing the problem, target users, and overall solution approach._

2. **Phase 2: Spec Creation**
   - The Project Manager will provide project-specific information relevant to the spec including proposed technical stack (including 3rd party tools), and additional specific requirements.
   - The Project Manager and Technical Fellow (AI) iterate on the core features and technical stack.
   - Produce a Spec Doc outlining:
     - Tech stack 
	     - If we are applying technologies for which we do not have knowledge, indicate this.  This means you need to search in tool-guides for available knowledge.
	     - Project Manager to gather missing knowledge and add to project.
	     - A concise list or object describing the tech stack components or tools and whether or not we have additional knowledge guides on each one.
     - Top-level features and major workflows
     - Architectural considerations and system boundaries
     - Sample data, quick UI sketches/wireframes (if applicable)
   - Keep the doc concise and focused on coordination between components.
   - Outcome: _A living doc with architectural overview and component integration strategy._

3. **Phase 3: High-Level Design & Slice Planning**
   - Convert the spec into logical vertical slices of functionality (start with 3-5 slices)
   - Categorize work into three types:
     - **Foundation work** (must be done first, hard to slice - e.g., project setup, core architecture)
     - **Independent features** (can be sliced vertically - e.g., user auth, dashboard, reporting)
     - **Integration work** (happens after features are built - e.g., performance optimization, deployment)
   - Each slice should be as independent as possible and deliver meaningful user value
   - Identify dependencies between slices and create implementation order
   - For complex projects, create lightweight "slice sketches" to identify potential conflicts
   - Technical Fellow AI should assist in identifying meaningful slice boundaries
   - Outcome: _Ordered list of slices with dependencies and rough effort estimates._

**For each slice, execute the following phases:**

4. **Phase 4: Slice Design (Low-Level Design)**
   - Create detailed design for the specific slice
   - Include specific technical decisions, data flows, and component interactions
   - Identify any cross-slice dependencies or conflicts
   - Create mockups or detailed specifications for UI components
   - Save as `private/slices/nn-slice.{slice-name}.md` where nn is sequential (01, 02, etc.)
   - Outcome: _Detailed design document for implementing this slice._

5. **Phase 5: Slice Task Breakdown**
   - Convert slice design into granular, actionable tasks
   - For each {tool} in use described in the design, ensure that you consult knowledge in `tool-guides/{tool}/`.  If not present search web if possible and alert Project Manager.
   - Only include tasks that can reasonably be completed by an AI. Do not include open-ended human-centric tasks such as SEO optimization.
   - If insufficient information is available to fully convert an item into tasks, _stop_ and request clarifying information before continuing.
   - Save as `private/tasks/nn-tasks.{slice-name}.md` using existing task file naming conventions
   - Include YAML front matter and context header:
     ```yaml
     ---
     slice: {slice-name}
     project: {project-name}
     lld: private/slices/nn-slice.{slice-name}.md
     dependencies: [list-of-prerequisite-slices]
     projectState: brief description of current state
     lastUpdated: YYYY-MM-DD
     ---
     
     ## Context Summary
     - Working on {slice-name} slice
     - Current project state and key assumptions
     - Dependencies and prerequisites
     - What this slice delivers
     - Next planned slice
     ```
   - Each task must have:
     - Clearly defined scope (precise and narrow)
     - Actionable, unambiguous instructions for junior AI or human developer
     - Success criteria clearly defined (what done looks like)
   - Common Task Considerations:
	   - If this project contains package.json, ensure a project setup task is created and add the scripts contained in `snippets/npm-scripts.ai-support.json` to its scripts block.  This also applies when creating package.json.
   - Outcome: _A detailed task list that can be executed in a single context session._

6. **Phase 6: Task Enhancement and Expansion**
   - For the slice task breakdown, examine tasks to see if we can enhance or expand/subdivide them to improve the chances that our "junior" AI workers can complete assigned tasks on their own.
   - If a task would not benefit from expansion, output it verbatim.
   - Use `guide.ai-project.06-task-expansion` for detailed guidance on this phase.
   - Success: All tasks have been processed and either output as is, or enhanced and divided into further subtasks.
   - Outcome: _Ready-to-execute task list with sufficient detail for reliable completion._

7. **Phase 7: Slice Execution (AI/Human Collaboration)**
   - Tasks are assigned to the Senior AI or human developers. They will delegate tasks to the Junior AIs or junior human developers.
   - The Project Manager or Senior AI (in a reviewer capacity) perform:
   - Code reviews
   - Design reviews
   - Ensuring alignment with the slice design and overall project vision
   - Outcome: _Working software increment for the slice, tested and validated._

8. **Phase 8: Slice Integration & Iteration**
   - Integrate completed slice with existing codebase
   - For single-developer projects, this is typically straightforward
   - For team projects or future parallelization, this becomes similar to git merge/PR integration
   - Verify that slice dependencies and interfaces work as expected
   - Update project documentation and architecture understanding
   - Plan next slice or address any issues discovered
   - Outcome: _Integrated functionality ready for the next development cycle._

---

#### When to Use Slice-Based vs Traditional Approach

**Use Slice-Based Approach When:**
- Project has multiple distinct features or user workflows
- Custom UI development is required
- Project will take more than 2-3 weeks of development time
- Multiple team members (AI or human) will be working on different parts
- Requirements are likely to evolve based on early implementations

**Use Traditional Approach (Phases 1-2, then direct to Phase 5-7) When:**
- Single feature addition to existing project
- Small maintenance or refactoring tasks
- Proof of concept or prototype development
- Project can be completed in a few days

---

### Resource Structure
The following structure should be present in every project.  Assume files are in markdown format (.md) unless otherwise specified.  Tool documentation may also be present as .pdf.

```
{project-root}/
└── project-documents/
    ├── project-guides/    # process & methodology (start here)
    ├── framework-guides/  # app-level platforms (Next.js, Astro …)
    ├── tool-guides/       # importable libs (SciChart, Three.js …)
    ├── api-guides/        # external data endpoints (USGS, ArcGIS …)
    ├── domain-guides/     # cross-cutting subject matter (hydrology …)
    ├── snippets/          # reusable templates / code fragments
    └── private/           # project-specific artifacts (tasks, UI, reviews)
```

###### private subfolders
```markdown
* private/: information customized to our current project.
* private/slices/: slice-specific low-level designs (nn-slice.{slice-name}.md)
* private/code-reviews: code review findings, task lists, and 
  resolutions.
* private/maintenance:  maintenance item issue and resolution 
  tracking.
* private/project-guides: project-specific guide customizations.
* private/tasks: all task breakdown files (nn-tasks.{slice-name}.md or legacy files).
* private/ui: UI specific designs, tasks, and guidance for our 
  project.
* private/ui/screenshots: supporting images for UI information.
```

> Each folder has its own `README.md` or `introduction.md` with deeper context.  
> Attachments live in `project-documents/z-attachments/`.

###### Project Guide Files
```markdown
These files, shared by all of our projects, are contained in {project-root}/project-documents/project-guides/.  Synonyms (syn, aka (for also known as)) are provided as some older documentation may still reference by these names.

* guide.ai-project.00-process (aka: AI Project Guide): this document.  Describes 
  roles and project phases.  Always start here.
* guide.ai-project.01-concept (aka: AI Project Concept Guide): details on creating 
  Project Concept documents.
* guide.ai-project.02-spec (aka: AI Spec Guide): details on creating Project 
  Specification (Spec) documents.
* guide.ai-project.03-slice-planning: guidance on creating high-level design
  and breaking projects into vertical slices.
* guide.ai-project.04-slice-design: detailed guidance on creating low-level designs
  for individual slices.
* guide.ai-project.06-task-expansion (aka: AI Task Expansion Guide): specific 
  guidance on task expansion for slice-based development.
* guide.ai-project.90-code-review (aka: AI Code Review Guide): specific guidance for 
  performing and responding to code reviews.
* guide.ai-project.91-legacy-task-migration: guidance for migrating legacy projects
  to the slice-based methodology.
* guide.ui-development.ai (aka: AI Development Guide - UI): specific guidance 
  pertaining to UI/UX tasks.
* prompt.ai-project.system (aka: AI Project Prompt Templates): parameterized 
  prompts to assist in creating and completing projects using the AI Project 
  Guide. Usable by humans or AIs.
* prompt.code-review-crawler: prompt for automated code review crawling.
* notes.ai-project.onboarding: onboarding notes primarily for human developers.
* rules/: modular code rules organized by platform/technology.  Copy to IDE-specific directories (.cursor/rules/, .windsurf/rules/, etc) as needed.  

Additional Relevant in `project-documents/` Directory:
* directory-structure: defines our `project-documents` directory structure
* file-naming-conventions: describes our file-naming conventions
```

###### Tool Guide Files
```markdown
These files provide knowledge on use of 3rd party tools, both in general and in specific {tool} subdirectories.  All documents for {tool} will be in the `tool-guides/{tool}/` subdirectory.  Always start with tool's introduction, which should be located at `tool-guides/{tool}/introduction.md`.  If you cannot locate this, confirm usage of the tool and presence of its documentation with the Project Manager before starting work.

* introduction (aka: AI Tool Overview - {tool}): Overall guidance for 
  {tool}.  Always start here.
* setup: Information on installing and configuring {tool}.
* guide.{descriptions}: our specific guides and indices.  If `documentation` 
  subdirectory is present, these guides may be built from review of 
  documentation files.
* {tool}/documentation: documentation by tool authors, from web or download.  
  May be in alternate formats such as PDF.
* {tool}/research-crumbs: specific knowledge items for {tool}.  often used to 
  provide additional detail for a complex {tool} task.
```

##### Task Files
```markdown
Task files are created in several places as the output of various prompts.  All such files should be created using checklist format.  For any such file, important sub-items and all success criteria should have checkboxes.  Do not include time estimates, though you may include relative effort levels (1-n not 15 min, 2 hours, etc).

The following provides an example of a well-created task file item:

### Task 3.4: Migrate BlogIndexCard
**Owner**: Junior AI
**Dependencies**: Task 3.3
**Objective**: Migrate complex BlogIndexCard that loads and displays multiple posts.

**Migration Steps**:
- [x] **Create ui-core component**:
- File: `packages/ui-core/src/components/cards/BlogIndexCard.tsx`
- Remove getAllContent dependency
- Add ContentProvider for multiple content loading
- Abstract content fetching logic

- [x] **Handle complex content loading**:
- Support for loading multiple posts
- Filtering and limiting functionality
- Sorting by date

- [x] **Framework integration**:
- Next.js adapter with server-side content loading
- Preserve async functionality for server components

**Success Criteria**:
- [x] Multiple post loading works
- [x] Filtering and limiting functional
- [x] Date sorting preserved
- [x] Server component compatibility maintained

**Files to Create**:
- `packages/ui-core/src/components/cards/BlogIndexCard.tsx`
- `packages/ui-adapters/nextjs/src/components/BlogIndexCardWithContent.tsx`
```
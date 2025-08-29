# Rummage – Phase 1 Concept Document

**Version:** 0.1  
**Date:** 2025‑08‑12  
**Project:** `rummage`  
**Primary Category Goal:** Best Local Agent (OpenAI Hackathon)  
**Secondary Category Goal:** For Humanity  
**License Intent:** Apache‑2.0 (OSS)

---

## High-Level Project Concept
**Rummage** is a local‑first AI librarian that lets users converse with their files (photos, downloads, documents, external drives), visualize insights, and apply safe, reversible organization plans—all offline.  

**Hero Flow:** Photo Finder & Librarian — natural‑language search, smart albums, rename proposals, calendar heatmap.  
**Secondary Flow:** Downloads Triage — classification, duplicate detection, Sankey previews for reorganization.

**Unique Value:** Combines semantic search, visual insights, and AI‑planned safe actions across arbitrary folders/drives, with privacy‑preserving local execution.

**Runs On:** Desktop (macOS, Windows, Linux).  
**Access:** Native desktop app; optional responsive web UI (PWA) to control from mobile.  
**Scope:** Full system MVP including UI, indexer, planner, and visualization.

---

### Target Users
- **Everyday Organizer:** Wants to find specific photos and clean up Downloads quickly.
- **Power Helper:** Tech‑savvy family member providing trusted help.
- **Freelancers/Pros:** Require private, offline tools for sensitive or client data.

---

### Proposed Technical Stack
- **UI:** Electron + React + TypeScript + Tailwind CSS v4 + shadcn/ui.
- **Core Services:** Node/TypeScript; optional C++ addons for performance.
- **Indexing:** File scanning, EXIF extraction, hashing (xxhash/blake3), OCR (Tesseract for PDFs/screenshots).
- **Embeddings:** MiniLM for text, CLIP for images (ONNX Runtime).
- **Data Store:** SQLite/DuckDB with vector search (sqlite-vss or similar).
- **Planner:** GPT‑OSS‑20B for intent → plan → explanation; optional 120B mode.
- **Static Site:** Astro for landing/docs site.

---

### Proposed Development Methodology
In general, favor simplicity and avoid over-engineering. Remember the cliché about premature optimization. Use industry‑standard solutions where practical and available. Avoid reinventing wheels.
- Hackathon‑driven rapid prototyping.
- Build core features first, with visual polish after.
- Safety‑first execution: all changes simulated, previewed, and reversible.
- Modular architecture to allow post‑hackathon extension.

---

### Summary
Rummage delivers practical, high‑impact local AI assistance for file and photo management. It fills a gap left by cloud‑locked or overly technical tools, offering an intuitive, private, and safe way to find and organize digital life.

**MVP Deliverables:**
- Photo Finder (search, albums, rename, heatmap).
- Downloads Triage (classification, duplicate detection, Sankey preview).
- Visualizations (treemap, heatmap, Sankey).
- Safety features (read‑only default, rollback).
- Documentation (README, CONTRIBUTING, Astro docs site).

**Stretch Goals:** Voice chat, few‑shot tagging, old‑drive analysis, OCR language packs.

---

### Output Location
Save as `01-concept.rummage.md` in `project-documents/private/project-guides/`.


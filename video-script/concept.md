# Video Concept: Integrating Agentic Workflow into Brownfield Projects

## Meta

- **Title (working)**: "Agentic Development im Brownfield — So automatisierst du in bestehenden Projekten"
- **Format**: YouTube Video, 10–15 min, German, casual/conversational (dev-vlog style)
- **Audience**: Senior developers / Tech leads in enterprise environments
- **Accompanying**: Blog post (later, separate deliverable)
- **Demo repo**: This monorepo (Angular 21 + NestJS, Nx workspace)

---

## Core Premise

The repo starts **completely clean** — no `copilot-instructions.md`, no `ARCHITECTURE.md`, no `.prompt.md`, no agent configuration of any kind. This represents a typical brownfield enterprise project that has never used agentic workflows. The video shows the full journey from zero to a working agent orchestrator.

---

## Narrative Arc

### Cold Open (5–10 sec)

**Purpose**: Hook viewers immediately with the failure.

- Quick cut: terminal showing SSR crash / browser showing FOUC
- Text overlay or voiceover: "KI-Agenten in bestehenden Projekten? Das passiert ohne Vorbereitung."
- Cut from Section 1 recording takes (no separate recording needed)

---

### Section 1: The Problem — Why It's Hard (1–2 min)

**Key message**: Agentic workflows sound great on greenfield demos, but enterprise/brownfield projects are different.

- Enterprise reality: implicit conventions, hidden coupling, SSR constraints, strict CI
- Agents fail when they don't understand context — wrong patterns, breaking SSR, ignoring lint rules or just use too many tokens which costs too much.
- This IS the starting point. No magic pre-configuration.

**Demo prompt** (on the CLEAN repo, no agent files):

> "Add a dark mode toggle to the app. It should persist the user's preference across sessions."

**Expected agent mistakes** (without instruction files):

1. **Direct `localStorage` access** → `localStorage.getItem('theme')` in constructor/ngOnInit → crashes SSR ("localStorage is not defined")
2. **No `afterNextRender()` usage** → reads storage during server render → hydration mismatch (server renders light, client switches to dark)
3. **Misses existing `StorageService`** → creates own storage logic instead of using the SSR-safe wrapper already in the project
4. **May use NgModule or wrong DI patterns** → creates `DarkModeModule` instead of standalone component/service
5. **No skeleton/transition handling** → flash of wrong theme on page load (FOUC)

**Why this prompt works for the demo:**

- Relatable feature (everyone knows dark mode)
- Failure is VISIBLE (SSR crash in terminal or flash of wrong theme in browser)
- Easy to explain in 30 sec: "The agent doesn't know this is an SSR app with specific storage patterns"
- Same prompt in Section 2 (with instructions) produces correct code → satisfying before/after

---

### Section 2: Making the Project Accessible for Agents (3–4 min)

**Key message**: The first step is NOT building an orchestrator — it's making your project machine-readable.

**Starting state**: The repo has NO agent-related files. Just code, lint config, tests, Nx structure.

We CREATE each layer live on screen:

1. **`ARCHITECTURE.md`** — Project-level documentation agents can consume
   - Project structure, tech stack, conventions
   - What patterns to use (signals, standalone components)
   - What to avoid (direct browser APIs, NgModules)

2. **`.github/copilot-instructions.md`** — Behavioral constraints
   - SSR-safe requirements
   - Signal-based state management
   - Standalone components only
   - Use `StorageService` instead of direct `localStorage`

3. **Existing assets that already help** (no changes needed):
   - Nx workspace structure → clear project boundaries
   - Lint rules → automatic style enforcement
   - E2E tests → verification loop agents can use

**Demo**: Re-run the SAME task from Section 1 with the instruction files now in place → agent respects SSR constraints, uses correct patterns.

**Takeaway**: "Invest 1–2 hours documenting constraints → saves you from reviewing broken PRs forever."

---

### Transition (20–30 sec, voiceover only)

**Key message**: Don't try to automate everything at once. Start with one repeatable, low-risk task.

- Voiceover while opening VS Code / navigating to create the prompt file
- "Die Dokumentation allein reicht aber nicht. Wir brauchen einen wiederholbaren Workflow — und den fangen wir mit einem konkreten Task an."
- Briefly mention: identify candidate tasks (scaffolding, tests, repetitive refactors), pick ONE, encode it

> **Transition design note**: This segment uses generic language — no mention of the specific Section 4/5 feature. This allows swapping the demo feature in post-production without re-recording.

---

### Section 4: Creating the Agent — The Prompt File (3–4 min)

**Key message**: Your "agent" is a well-structured prompt file that encodes your team's workflow.

Show the prompt file structure (the custom orchestrator):

- **Context section**: What the project is, key constraints
- **Workflow steps**: Discovery → Plan → Implement → Verify
- **Tool instructions**: Which commands to run, what tests to execute
- **Scope boundaries**: What the agent should NOT touch

**Demo** (screen recording):

- Create the `.prompt.md` file from scratch
- Walk through each section, explain WHY it matters
- Show how it references project-specific files (`ARCHITECTURE.md`, lint rules, test commands)
- In this demo: we automate **"allow the users to attach images to petitions BE and UI"**
- **Fallback feature**: If image upload proves too unpredictable during recording, swap to **"add notes/comments to petitions"** (text-only CRUD, same orchestrator structure, simpler output)

---

### Section 5: Orchestrator in Action — Plan + Implementation (3–4 min)

**Key message**: A simple orchestrator pattern (plan → implement → verify) is enough to get reliable results.

**Demo** (screen recording in VS Code with Copilot):

1. Trigger the prompt file
2. Agent reads project context (`ARCHITECTURE.md`, existing code patterns)
3. Agent creates a plan (show the plan output)
4. Agent implements the change step-by-step
5. Agent runs tests/lint to verify
6. Show the final diff — clean, convention-respecting change

**Highlights**:

- The orchestrator pattern is just "plan → execute → verify" with explicit constraints
- Call out what went right: SSR-safe code, correct patterns, tests pass
- Brief mention: what to do when it fails (iterate on prompt, add more constraints)

---

### Closing (30 sec)

- Recap: make project accessible → start small → encode workflow in prompt → plan + implement + verify
- CTA: "Probier's diese Woche mit einem Task in eurem Projekt aus"
- Link to blog post / repo

---

## Production Notes

### Screen Recordings Needed

1. **Cold open footage** — extracted from Section 1 takes (no separate recording)
2. **"Naive agent failure"** on clean repo — agent makes wrong choices (30 sec, record 3–5 takes)
3. **Creating ARCHITECTURE.md + copilot-instructions.md** — show thought process, cut to final file (2 min)
4. **Same task re-run WITH instructions** → agent succeeds, before/after contrast (30 sec)
5. **Prompt file walkthrough** — creating and explaining the .prompt.md (2 min)
6. **Full orchestrator execution** — plan + implement + verify cycle (3 min, record both "images" and "notes" versions)

### Recording Order (hardest first)

| Priority | Segment                               | Takes | Rationale                                   |
| -------- | ------------------------------------- | ----- | ------------------------------------------- |
| 1        | Section 5 (orchestrator demo)         | 2–3   | Most complex. Record both feature variants. |
| 2        | Section 1 (naive failure)             | 3–5   | Unpredictable — pick best in edit           |
| 3        | Section 2b (re-run with instructions) | 1–2   | Controlled, should succeed                  |
| 4        | Section 2a (creating docs)            | 1–2   | Scripted walkthrough                        |
| 5        | Section 4 (prompt file explanation)   | 1     | Pure narration                              |
| 6        | Cold open + Transition + Closing      | —     | Cut from footage + voiceover                |

### Repo Preparation

- Strip ALL agent-related files before recording:
  - `.github/copilot-instructions.md`
  - `ARCHITECTURE.md`
  - Any `.agent.md` / `.prompt.md` files
  - Any `/memories/` content
- The repo should look like a typical enterprise project with NO agent setup

### Git Strategy

Use separate branches/commits to show progression:

- `clean` — stripped repo, no agent files (starting point)
- `documented` — after adding ARCHITECTURE.md + copilot-instructions.md
- `orchestrated` — after adding the prompt file

### Transition Design (editorial flexibility)

Each section ends with a **generic statement** that doesn't reference the specific Section 5 feature:

- **Section 2 → Transition**: "Die Dokumentation allein reicht nicht. Wir brauchen einen wiederholbaren Workflow."
- **Transition → Section 4**: "Fangen wir mit einem konkreten Task an." (then feature name appears)
- **Section 4 → Section 5**: "Schauen wir uns an, was passiert wenn wir das ausführen."

This means Section 5 can be **swapped** (images ↔ notes) in post without re-recording surrounding sections.

### Contingency for Section 1

- Record 3–5 takes of the dark mode prompt on `clean` branch
- If agent happens to succeed: use fallback prompt **"Add SSR-compatible route animations with page transitions"** — reliably fails without SSR instructions
- Pick the most visually dramatic failure in post-production

### Visual Style

- VS Code with Copilot chat visible (panel wide enough to read without scrolling)
- Terminal output, file diffs
- No slides — all screen recordings + German voiceover
- Casual vlog style
- Font size: 16pt+ for YouTube readability
- Time-lapse agent "thinking" at 2x–4x with progress indicator overlay
- Voiceover recorded separately for editing flexibility

---

## Key Decisions

| Decision            | Choice                                                  |
| ------------------- | ------------------------------------------------------- |
| Language            | German                                                  |
| Format              | Screen recording + voiceover (no slides)                |
| Starting state      | Repo CLEAN — all agent files removed                    |
| Journey shown       | Naked project → documented → agent-ready → orchestrated |
| Orchestrator type   | `.prompt.md` file executed via Copilot in VS Code       |
| Demo project        | This monorepo                                           |
| Blog post           | Separate deliverable (later)                            |
| Cold open           | Yes — 5–10 sec failure clip before intro                |
| Section 3           | Merged into 20–30 sec voiceover transition              |
| Section 5 feature   | "Attach images" (primary) / "Add notes" (fallback)      |
| Recording order     | Hardest first (Section 5 → 1 → 2b → 2a → 4 → voiceover) |
| Transition strategy | Generic section endings — Section 5 swappable in post   |

---

## Open Items for Script Writer

- [x] ~~Exact wording for the "naive failure" prompt~~ → "Add a dark mode toggle to the app. It should persist the user's preference across sessions."
- [x] ~~Which specific feature to implement in the demo~~ → Section 1+2: dark mode toggle; Section 4–5: attach images to petitions (BE + UI), fallback: notes/comments
- [x] ~~Video structure~~ → Cold open + 4 sections (Section 3 merged into transition) + closing
- [x] ~~Recording workflow~~ → Out-of-order (hardest first), transition points for editorial flexibility
- [ ] Exact `.prompt.md` content to be shown (needs to be created/finalized) → **IN PROGRESS** (see `.github/prompts/`)
- [ ] Intro/outro style (face cam? pure voiceover? mix?)
- [ ] How much German vs. English terminology to use (code stays English, explanation in German)

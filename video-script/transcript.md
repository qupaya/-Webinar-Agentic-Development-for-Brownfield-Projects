# Video Script: Agentic Development im Brownfield

> **Format**: YouTube Video, ~15 min, German voiceover, dev-vlog style  
> **Audience**: Senior developers / Tech leads in enterprise environments  
> **Notation**:
>
> - `[SCREEN: ...]` = What's visible on screen
> - `[CUT: ...]` = Edit instruction
> - `[SFX: ...]` = Sound effect
> - Voiceover text is in German, plain paragraphs
> - _Italics_ = emphasis in delivery
> - `(pause)` = deliberate beat

---

## Cold Open (5–10 sec)

`[SCREEN: Terminal showing SSR crash — "ReferenceError: localStorage is not defined" with red error stack trace]`

`[CUT: Quick flash — browser with broken layout, flash of unstyled content]`

`[SFX: Error buzz / record scratch]`

Ja... so schaut's aus wenn man einfach loslegt.

`[CUT: Title card — "Agentic Development im Brownfield"]`

---

## Section 1: The Problem — Why It's Hard (~2 min)

`[SCREEN: VS Code, clean repo open. No ARCHITECTURE.md, no copilot-instructions.md visible in the file tree. Just code, configs, tests.]`

Hey! Sagt mal — wie viele Tokens habt ihr schon diese Woche verbrannt? (pause) Ja. Ich auch.

Ich bin Saninn Giancarlo, Senior Software Developer bei Qupaya, und heute reden wir über ein Thema, das mich seit Monaten nervt.

Kennt ihr das? Ihr schaut so ein KI-Video — "Build a full-stack app in 10 minutes with AI!" — und der startet mit einem leeren Ordner. Greenfield. Keine History, keine Legacy-Patterns, keine Altlasten. Und man denkt sich: Cool. Mach das mal mit _meinem_ Projekt.

(pause)

Ich hab's probiert. Ihr sicher auch. Und es war... nicht so toll. Der Agent schreibt Code, der erst mal gut aussieht — aber nicht zu dem passt, was im Projekt schon da ist.

`[SCREEN: Briefly scroll through file tree showing apps/, libs/, configs — a real project]`

Ich hab hier ein normales Enterprise-Projekt. Angular 21 Monorepo, Server-Side Rendering, NestJS-Backend, Nx-Workspace. Nix Fancy — halt das, was man in der Firma so hat. Gewachsen, mit Regeln, die keiner aufgeschrieben hat.

Und genau _das_ ist das Problem. Der KI-Agent ist wie ein neuer Developer im Team. Der kann viel — aber er kennt euer Projekt nicht. Er weiß nix von SSR. Er weiß nix vom `StorageService`. Er kennt eure Regeln nicht. Und genau wie ein neuer Developer ohne Onboarding — er rät. Und er rät _falsch_.

Das Ergebnis kennt ihr: Code der kompiliert, der _aussieht_ als ob er geht — aber die App kaputt macht.

(pause)

Und heute zeig ich euch, was man dagegen tun kann. Kein Greenfield. Kein Happy Path. Euer Projekt, eure Regeln — nur so, dass der Agent sie versteht.

Schauen wir erst mal an, wie's _ohne_ das aussieht.

### Demo: Naive Agent Failure

`[SCREEN: Open Copilot Chat panel. Type the prompt:]`

> "Add a dark mode toggle to the app. It should persist the user's preference across sessions."

`[SCREEN: Agent generates code. Let it run — don't interrupt. Show the output.]`

`[CUT: Time-lapse the agent "thinking" at 2x–4x speed if it takes long]`

So. Schauen wir uns an, was er uns gebastelt hat.

`[SCREEN: Highlight the generated code — focus on the problematic parts]`

Und da haben wir's — `localStorage.getItem('theme')` direkt im Constructor. Klassiker. Das crasht auf dem Server, weil `localStorage` in Node.js nicht existiert.

`[SCREEN: Show terminal with SSR error: "ReferenceError: localStorage is not defined"]`

Boom. `ReferenceError`. Danke für nix.

`[SCREEN: Show the existing StorageService file briefly]`

Und das Beste: Wir _haben_ schon einen `StorageService`, der genau das löst. SSR-safe, getestet, alles da. Aber der Agent wusste nix davon.

Vielleicht hat er noch ein NgModule gebaut — obwohl das Projekt nur Standalone Components hat. Nett, aber — nein.

(pause)

Das ist nicht die Schuld vom Agenten. Der hat keine Infos bekommen. Gib mir nix, und ich rate auch falsch.

Die Frage ist: Wie machen wir's besser?

---

## Section 2: Making the Project Accessible for Agents (~3.5 min)

`[SCREEN: VS Code, same repo. File tree visible.]`

Okay, jetzt wird's gut — weil die Lösung ist fast zu einfach. Ein bis zwei Stunden Arbeit. Wirklich.

Und nein — der erste Schritt ist _nicht_, einen Orchestrator zu bauen. Der erste Schritt ist viel simpler: Mach dein Projekt lesbar für Maschinen.

(pause)

### Layer 1: ARCHITECTURE.md

`[SCREEN: Create new file ARCHITECTURE.md in project root]`

Wir fangen mit einer `ARCHITECTURE.md` an. Ganz simpel: Was ist das hier? Welche Technologien? Welche Konventionen?

`[SCREEN: Show the ARCHITECTURE.md being written / final content. Scroll through key sections:]`

- Project overview
- Tech stack
- Data model
- Component structure
- Service layer

Ja, das klingt nach normaler Doku. Ist es auch! Aber — und das ist der Trick — wir schreiben die für _Maschinen_, nicht für neue Team-Mitglieder. Kurz, klar, mit Struktur. Keine Prosa, kein Meeting-Protokoll.

`[SCREEN: Highlight specific section, e.g. "Services" with bullet points about StorageService, TodoService, AuthService]`

Schaut her: "StorageService — SSR-safe localStorage wrapper. _Always_ use this instead of direct localStorage." Ein Satz. Aber _genau_ dieser Satz hätte den Crash vorhin verhindert.

### Layer 2: copilot-instructions.md

`[SCREEN: Create .github/copilot-instructions.md]`

Das zweite Layer ist die `copilot-instructions.md`. Die ist super — die wird von Copilot _automatisch_ geladen, bei jeder Interaktion. Einmal schreiben, immer aktiv.

Hier rein kommen die harten Regeln.

`[SCREEN: Show the file content — scroll through key sections:]`

- SSR Safety rules
- Signals over observables
- Standalone components only
- inject() pattern

SSR-Safety: Finger weg von `window`, `document`, `localStorage`. Immer über `isPlatformBrowser()` oder `afterNextRender()` gehen.

State Management: Signals. Keine Observables für UI-State. Punkt.

Components: Standalone only. NgModules? Gibt's hier nicht.

`[SCREEN: Highlight the "What NOT to do" section]`

Und ganz wichtig — eine "Was du NICHT tun sollst"-Sektion. Klingt viel, aber Agenten _brauchen_ das. Wenn du es nicht klar verbietest, bauen die Patterns, die technisch laufen — aber nicht zu eurem Projekt passen.

### Layer 3: What's already helping (no changes needed)

`[SCREEN: Show nx.json, eslint.config.mjs, e2e test files briefly]`

Und dann — das ist das Gute — gibt's Sachen, die _schon da sind_ und helfen. Ohne dass ihr was ändert. Euer Nx-Workspace gibt klare Grenzen vor. Die Lint-Rules checken Style automatisch. Und wenn ihr E2E-Tests habt? Boom — der Agent kann sich selbst testen. Gratis.

(pause)

### Demo: Re-run with instructions

`[SCREEN: Same Copilot Chat. Same prompt:]`

> "Add a dark mode toggle to the app. It should persist the user's preference across sessions."

`[SCREEN: Agent runs again — this time WITH ARCHITECTURE.md and copilot-instructions.md present]`

`[CUT: Time-lapse at 2x–4x]`

Und jetzt schauen wir uns an, was diesmal rauskommt.

`[SCREEN: Show the generated code — highlight the correct patterns:]`

- Uses `StorageService` instead of direct localStorage
- Uses `afterNextRender()` for hydration
- Uses signals for state
- Standalone service, no NgModule

Schaut! Er nimmt den `StorageService`. Er wartet auf Hydration mit `afterNextRender`. Signals statt BehaviorSubject. Und kein NgModule.

`[SCREEN: Show terminal — no SSR crash, app runs cleanly]`

Und? Kein Crash. Kein Flash of Wrong Theme. Läuft einfach.

Derselbe Agent, dieselbe Aufgabe — aber mit Kontext liefert er _guten_ Code. Das ist alles.

(pause)

Zwei Dateien. Ein, zwei Stunden Arbeit. Und ab jetzt spart ihr euch das Review von kaputtem Code — bei _jedem_ Task.

---

## Transition (~25 sec)

`[SCREEN: Soft transition — VS Code in background, slightly blurred. No specific file visible.]`

So — die Doku allein ist schon gut. Aber ehrlich: Das stoppt _Fehler_. Das automatisiert noch nix.

Was wir wollen, ist ein Prozess der sich wiederholt. Ein Agent, der nicht nur weiß was er _nicht_ tun soll — sondern auch, _wie_ er vorgehen soll. Welche Schritte, welche Reihenfolge, wie er sich selbst checkt.

(pause)

Und genau das bauen wir jetzt. Mit einem konkreten Task.

---

## Section 4: Creating the Agent — The Prompt File (~3–4 min)

> **[TODO — PENDING PROMPT FILE DEVELOPMENT]**
>
> This section will be scripted once the `.prompt.md` orchestrator file and agent configuration are finalized.
>
> **Planned content:**
>
> - Create the `.prompt.md` file from scratch on screen
> - Walk through each section: Context, Workflow phases (Discovery → Plan → Implement → Verify), Tool instructions, Scope boundaries
> - Explain WHY each section matters
> - Show how it references project-specific files (ARCHITECTURE.md, lint rules, test commands)
> - Introduce the specific feature that will be implemented in Section 5
>
> **Key talking points to cover:**
>
> - "Dein Agent ist ein gut strukturiertes Prompt-File, das den Workflow eures Teams codiert."
> - The prompt file is NOT magic — it's structured documentation of what a senior dev would do
> - The orchestrator pattern: plan → implement → verify
> - Explicit scope boundaries prevent agents from touching unrelated code
> - Reference `implement-feature.prompt.md` structure
>
> **Estimated duration**: 3–4 min  
> **Recording**: Pure narration with screen walkthrough, 1 take

---

## Section 5: Orchestrator in Action — Plan + Implementation (~3–4 min)

> **[TODO — PENDING PROMPT FILE DEVELOPMENT]**
>
> This section will be scripted once the orchestrator prompt and agent workflow are finalized and tested.
>
> **Two variants to script:**
>
> ### Section 5A: Attach Images to Petitions (Primary)
>
> - Trigger the prompt file with image-upload feature spec
> - Agent reads context, creates plan, implements full-stack change
> - Show: model → entity → backend → frontend pipeline
> - Highlight: multer upload, FormData, SSR-safe image display
> - Run verification (build + lint + test)
> - Show final diff
>
> ### Section 5B: Add Notes/Comments to Petitions (Fallback)
>
> - Trigger with notes feature spec
> - Same orchestrator flow, simpler output
> - Show: Note entity, sub-resource endpoint, detail component section
> - Highlight: ManyToOne relation, chronological display, admin-only creation
> - Run verification
> - Show final diff
>
> **Key talking points to cover:**
>
> - The orchestrator pattern is just "plan → execute → verify" with explicit constraints
> - Call out what went right: SSR-safe code, correct patterns, tests pass
> - Brief mention: what to do when it fails (iterate on prompt, add more constraints)
> - "Ein einfaches Plan-Execute-Verify-Pattern reicht aus für zuverlässige Ergebnisse."
>
> **Transition design**: Section endings are generic (no feature name) so 5A/5B are swappable in post.
>
> **Estimated duration**: 3–4 min per variant  
> **Recording**: 2–3 takes per variant, pick best in edit

---

## Closing (~30 sec)

`[SCREEN: VS Code with the completed project — file tree showing ARCHITECTURE.md, copilot-instructions.md, .github/prompts/ folder. Clean, organized.]`

Kurz zusammen:

Erstens: Mach dein Projekt lesbar für Agenten. `ARCHITECTURE.md`, `copilot-instructions.md` — ein, zwei Stunden, und die schlimmsten Fehler sind weg.

Zweitens: Fang klein an. _Ein_ Task. Ein Prompt-File. Nicht alles auf einmal.

Drittens: Plan, Implement, Verify. Mehr braucht's nicht.

(pause)

Probiert das diese Woche mit einem Task in eurem Projekt. Link zum Repo ist in der Beschreibung.

`[SCREEN: End card with repo link, channel subscribe prompt]`

Und damit — bis zum nächsten Mal!

`[CUT: End]`

---

## Production Reference

### Timing Budget

| Section                 | Target Duration | Word Count (approx.) |
| ----------------------- | --------------- | -------------------- |
| Cold Open               | 5–10 sec        | ~20 words            |
| Section 1               | 1.5–2 min       | ~300 words           |
| Section 2               | 3–3.5 min       | ~550 words           |
| Transition              | 20–25 sec       | ~60 words            |
| Section 4               | 3–4 min         | [TODO]               |
| Section 5               | 3–4 min         | [TODO]               |
| Closing                 | 30 sec          | ~90 words            |
| **Total (without 4+5)** | **~7 min**      | **~1020 words**      |
| **Total (with 4+5)**    | **~14–15 min**  | **~2200–2400 words** |

### Recording Order (from concept.md)

| Priority | Segment                               | Takes | Notes                               |
| -------- | ------------------------------------- | ----- | ----------------------------------- |
| 1        | Section 5 (orchestrator demo)         | 2–3   | Most complex. Record both variants. |
| 2        | Section 1 (naive failure)             | 3–5   | Unpredictable — pick best in edit   |
| 3        | Section 2b (re-run with instructions) | 1–2   | Controlled, should succeed          |
| 4        | Section 2a (creating docs)            | 1–2   | Scripted walkthrough                |
| 5        | Section 4 (prompt file explanation)   | 1     | Pure narration                      |
| 6        | Cold Open + Transition + Closing      | —     | Cut from footage + voiceover        |

### Branch Strategy

- `clean` — stripped repo, no agent files (Sections 1 start)
- `documented` — after adding ARCHITECTURE.md + copilot-instructions.md (Section 2b)
- `orchestrated` — after adding the prompt file (Section 4+5)

### Contingency Prompts for Section 1

If the agent accidentally succeeds on the clean repo:

- Fallback prompt: "Add SSR-compatible route animations with page transitions"
- This reliably fails without SSR instructions

### Expected Agent Mistakes (Section 1 — reference for recording)

```typescript
// ❌ Mistake 1: Direct localStorage access (crashes SSR)
export class ThemeService {
  private theme = signal(localStorage.getItem('theme') || 'light');
  //                     ^^^^^^^^^^^^^^^^^ ReferenceError on server
}

// ❌ Mistake 2: No afterNextRender (hydration mismatch)
constructor() {
  this.applyTheme(); // runs during server render → mismatch
}

// ❌ Mistake 3: Ignores existing StorageService
// Creates its own storage logic instead of using:
// import { StorageService } from '@webinar/ui/api-services';

// ❌ Mistake 4: NgModule instead of standalone
@NgModule({
  declarations: [DarkModeToggleComponent],
  exports: [DarkModeToggleComponent]
})
export class DarkModeModule {} // Project is standalone-only!
```

### Correct Pattern (Section 2b — reference for recording)

```typescript
// ✅ SSR-safe dark mode with existing services
export class ThemeService {
  private storageService = inject(StorageService);
  private platformId = inject(PLATFORM_ID);

  theme = signal<'light' | 'dark'>('light');

  constructor() {
    afterNextRender(() => {
      const saved = this.storageService.getItem('theme');
      if (saved) this.theme.set(saved as 'light' | 'dark');
      this.applyTheme();
    });
  }
}
```

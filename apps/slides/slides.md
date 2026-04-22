---
theme: default
title: Integrating Agentic Development in Brownfield Projects
info: |
  Webinar deck on practical patterns for introducing agentic development into existing systems.
class: text-center
transition: slide-left
mdc: true
---

# Integrating Agentic Development

## in Brownfield Projects

From cautious experiments to reliable delivery

<div class="pt-8 opacity-80">
  Municipality Petition System Case Study
</div>

<!--
notes:
- Introduce the topic and set expectation: practical, not hype-driven.
- Emphasize this is based on real integration work in an existing monorepo.
-->

---

## layout: section

# Agenda

---

## What we will cover

1. What agentic development means in practice
2. Why brownfield projects need a different approach
3. Case study architecture and constraints
4. Where agents add value in delivery workflows
5. Pitfalls, guardrails, and operating model
6. Key takeaways and next steps

<!--
notes:
- Keep this short and show that this is organized around execution.
- Mention there will be a live demo section.
-->

---

## layout: section

# What is Agentic Development?

---

## layout: two-cols

## Working definition

Agentic development is a workflow where AI agents can:

- inspect an existing codebase
- propose or implement scoped changes
- run tools, tests, and validations
- report outcomes with traceability

::right::

## Not just autocomplete

It combines:

- reasoning over repository context
- deterministic tool execution
- instruction-driven behavior
- human oversight at decision points

<!--
notes:
- Clarify distinction between "assistant" and "agent".
- Mention that reliability comes from explicit constraints and validation loops.
-->

---

## layout: two-cols

## Brownfield reality

- legacy patterns coexist with modern frameworks
- incomplete documentation and hidden coupling
- strict non-functional constraints (security, performance, SSR)
- teams cannot pause delivery for a full rewrite

::right::

## Why this is hard for agents

- local conventions are often implicit
- fragile integration points are not obvious
- "correct" changes can still break behavior
- generated code may drift from architecture

<!--
notes:
- Position brownfield as a context with constraints, not a code quality judgment.
- Stress that agent quality depends on explicit context.
-->

---

# Case Study: Municipality Petition System

An Angular 21 + NestJS Nx monorepo used for webinar demos.

- SSR Angular frontend with hydration
- NestJS API + SQLite persistence
- shared model library for contracts
- e2e tests for status codes and cache-control behavior

## Integration constraint examples

- preserve SSR-safe patterns
- keep strict TypeScript and lint rules
- avoid regressions in HTTP behavior

<!--
notes:
- Connect technical stack to business value: predictable behavior under change.
- Mention that this structure is representative of many enterprise repositories.
-->

---

# Where Agents Fit in the Flow

1. Discovery and impact analysis
2. Targeted implementation
3. Verification and regression checks
4. Change explanation for reviewers

## High-leverage tasks

- mapping unfamiliar project structure quickly
- scaffolding new capabilities with workspace conventions
- applying repetitive but safe refactors
- generating first-pass tests and iterating on failures

<!--
notes:
- Explain that agents reduce search and setup costs.
- Keep responsibility boundaries clear: humans approve architecture and risk decisions.
-->

---

## layout: center

# Live Demo

### Prompt-to-implementation in an existing monorepo

Focus points:

- project discovery and constraints
- scoped edits with validation
- handling lint and test feedback loops

<!--
notes:
- Live section placeholder.
- Narrate each step: context gathering, edits, verification, summary.
-->

---

# Pitfalls and Lessons Learned

## Common failure modes

- over-broad edits that touch unrelated code
- ignoring SSR or runtime constraints
- passing compilation but breaking behavior
- weak change summaries that slow code review

## What fixed it

- stronger repo-level instructions
- explicit non-goals in prompts
- mandatory validation before completion
- tighter diff scopes and review heuristics

<!--
notes:
- Share one concrete example of a near miss and how process improved.
- Reinforce "workflow design" over "model magic".
-->

---

# Guardrails That Actually Work

- enforce architecture constraints in lint rules
- codify project conventions in workspace instructions
- require agents to run tests relevant to the change
- keep human approval gates for high-impact edits

## Operational model

- start with low-risk tasks
- measure cycle time and defect escape rate
- expand autonomy only with evidence

<!--
notes:
- Mention enforce-module-boundaries and strict CI as examples of objective guardrails.
- Explain progressive rollout strategy.
-->

---

# Key Takeaways

1. Brownfield projects are the best place to prove agentic value
2. Reliability depends on constraints, not raw generation quality
3. Small scoped loops beat large one-shot transformations
4. Teams need explicit governance, telemetry, and review discipline

## Next step

Pick one recurring, low-risk task and automate it end-to-end this sprint.

<!--
notes:
- End with an action-oriented recommendation.
- Encourage measuring outcomes from day one.
-->

---

layout: center
class: text-center

---

# Q&A

### Integrating Agentic Development in Brownfield Projects

Thank you.

<!--
notes:
- Optional backup discussion prompts: security, compliance, team adoption, ROI.
-->

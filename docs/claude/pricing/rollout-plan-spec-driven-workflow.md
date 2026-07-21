# Rollout plan — spec-driven workflow, Pricing squad

Context: 3 engineers, PO in Melbourne, no BA, no QE. The absence of a BA is the real reason this practice pays off here — the spec *is* the BA artefact, and Claude does the drafting labour that a BA would otherwise do.

---

## Why this works for your squad specifically

| Gap today | What the spec closes |
|---|---|
| No BA | Spec §1–§4 is the requirements analysis, drafted by the engineer with Claude, validated by the PO |
| No QE | Spec §3 acceptance criteria and §6 edge cases become the test cases, written before code |
| PO in another city/timezone | Async review artefact beats trying to align verbally across the gap |
| Rate changes and edge-case fixes recur on the same features | §9 decisions log means the next change starts from the spec, not from re-reading code |

---

## Phase 1 — Week 1: seed it yourself
Don't announce a process. Run it once, visibly, on one real workstream.

1. Add `.claude/specs/` with `_TEMPLATE.md` and the CLAUDE.md snippet.
2. Pick the next external refinance item. **You** do the plan-mode pass and produce the spec.
3. Send it to the PO with one framing line: *"Before we build this — does this match what you meant? Especially the non-goals."*
4. Whatever the PO pushes back on, keep the diff. That diff is your entire adoption argument: *this is the rework we just avoided.*

## Phase 2 — Weeks 2–4: one engineer at a time
- Assign the next spec to your strongest engineer, you review as if you were the PO before it goes to the PO.
- Then the next two engineers, one each.
- Review their **specs** carefully in this phase, not their code. What you reward in review is what the practice becomes.

## Phase 3 — Week 5+: make it the default
- Add to **Definition of Ready**: *a non-trivial story cannot enter a sprint without an Approved spec linked.*
- Add to the PR template: *"Spec: `SPEC-xxx` · ACs satisfied: AC1, AC3"*
- Add to **Definition of Done**: *spec updated if behaviour diverged.*

---

## Ceremonies

| When | What | Duration |
|---|---|---|
| Refinement | Engineer walks the spec, PO challenges §4 non-goals and §7 questions | 20 min per spec |
| Async (PO in Melbourne) | Spec posted as a PR against `.claude/specs/`. PO reviews as PR comments. Approval = PR approval. | — |
| Sprint review | Reference AC numbers when demoing | — |

**Make the PO's approval a Git action, not a Slack "yep".** A PR approval on the spec file gives you a timestamped, attributable sign-off with the review conversation attached. That's the single highest-leverage detail in this whole plan, and it costs the PO nothing extra.

---

## Guardrails — where this goes wrong

1. **Spec bloat.** If a spec takes longer to write than the feature takes to build, the trigger threshold is wrong. Tune what counts as "non-trivial"; small fixes should never get a spec.
2. **Spec drift.** A spec that no longer matches the code actively misleads the next person. Enforce "update the spec in the same PR" hard — this is the failure mode that kills the practice in month three.
3. **Claude writing plausible fiction.** Plan mode must *read the actual code and contracts* first. A spec that asserts what IPT returns without anyone checking is worse than no spec. That's why SPEC-PRC-014 has Q1 as an open question rather than a confident statement.
4. **The non-goals section going empty.** It is the most valuable section and the first one people skip. Reject specs without it.
5. **Theatre.** If the PO rubber-stamps every spec without comment, the checkpoint isn't working. Ask them directly to argue with §4.

---

## What to measure (30 / 60 / 90 days)

- Rework: stories reopened or materially rescoped after implementation started — should fall
- Cycle time from "story accepted" to "merged" — may rise slightly at first, should net fall
- PO review comments per spec — should be **non-zero**; zero means rubber-stamping
- Number of specs reused as context for a later change request — the compounding-value signal

---

## Talking points for the PO

- "This replaces the conversation we'd have three times, with one document we both edit once."
- "The non-goals section is for you. It's where you tell me what you *don't* want, before I've built it."
- "It takes you 15 minutes of review to save us a sprint of rework."
- "When we come back to change this in six months, we'll read this instead of guessing."

# Worktrees — when to parallelize, and when not to

## First, a distinction that gets blurred

Three engineers on three feature branches **is already parallelism**. Worktrees don't add
anything there — each engineer has their own clone and their own session.

Worktrees solve a narrower problem: **one person running two agent sessions on the same repo
at once**, without the two sessions fighting over the same working directory. That's mostly:

- you, reviewing or spiking something while an engineer's work is in flight
- one engineer holding two genuinely independent slices
- an engineer running a long refactor while doing a quick fix on another branch

If you find yourself reaching for worktrees to coordinate *between* engineers, that's a signal
the work isn't sliced cleanly — fix the slicing, don't add tooling.

---

## Timing: you are ~2 months from September

This matters more than the mechanics. Two months from a hard date is when work-in-progress
should be **going down**, not up. Parallelism raises WIP, and WIP is what turns a slip from
"one thing is late" into "three things are 80% done and nothing ships."

My honest read: for a 3-person squad in a regulated domain at this distance from the date,
**sequential should be the default and parallel should require a reason you'd defend out loud.**
Use the checklist below as a gate to say no, not as a menu of ways to go faster.

The thing that will actually save you time between now and September isn't parallelism — it's
the spec workflow catching a misunderstanding before it's built. Rework is the schedule risk,
not throughput.

---

## The go/no-go checklist

Parallelize only if **every** answer is yes. One no means sequence it.

| # | Question | If no |
|---|---|---|
| 1 | Do the two slices touch **disjoint sets of files**? | Sequence. Merge conflicts in pricing code are expensive to resolve safely. |
| 2 | Is every shared **type, DTO or contract** they both use already stable and merged? | Sequence. Slice B waiting on Slice A's interface is a dependency, not independence. |
| 3 | Do they touch **different config**? (`application.yml`, feature flags, Gradle) | Sequence. Config conflicts are silent and merge cleanly while being wrong. |
| 4 | Do they have **separate specs, both approved**? | Sequence — or rather, go get the specs approved first. |
| 5 | Are they **separately testable**? Can each pass its own tests without the other? | Sequence. |
| 6 | Would explaining the boundary between them take **under 10 minutes**? | Sequence. This is the coordination-cost trap: if the disambiguation brief is long, you've already spent the saving. |
| 7 | Is each slice **more than ~2 days** of work? | Don't bother. Setup and integration overhead exceeds the gain on small slices. |

---

## Worked example: go

**Slice A — repayment schedule rounding fix** (`SPEC-PRC-016`)
`**/repayment/schedule/**` + its tests. Pure local calculation, no downstream calls, no UI.

**Slice B — refinance banner in the pricing panel** (`SPEC-PRC-014`, banner portion only)
`**/web/pricing-panel/**` + its tests. Consumes `refinanceContext`, which merged to develop
three weeks ago and is stable.

| # | Check | |
|---|---|---|
| 1 | Disjoint files | ✅ `repayment/schedule` vs `web/pricing-panel` |
| 2 | Shared types stable | ✅ `refinanceContext` merged and unchanged since |
| 3 | Different config | ✅ A touches none; B touches one flag A doesn't read |
| 4 | Specs approved | ✅ both |
| 5 | Separately testable | ✅ different test suites |
| 6 | Boundary explainable | ✅ "A is the maths, B is the display, they don't meet" |
| 7 | Both >2 days | ✅ 3 and 4 days |

**Verdict: parallelize.** This is the shape to look for — a calculation change and a display
change, separated by a contract that already exists.

---

## Worked example: no-go (and this is the tempting one)

**Slice A — server-side PAC expiry validation** (SPEC-PRC-014, AC4)
**Slice B — refinance banner** (SPEC-PRC-014, AC1)

Both from the same approved spec, both refinance, both feel independent — one is validation,
one is display.

| # | Check | |
|---|---|---|
| 1 | Disjoint files | ❌ both touch `PricingLookupService` and `PricingLookupResponse` |
| 2 | Shared types stable | ❌ A adds an error code to the response B renders |
| 3 | Different config | ❌ both under `pricing.lookup.*` |
| 6 | Boundary explainable | ❌ "B shows the banner unless A's validation failed, in which case B shows..." |

**Verdict: sequence.** A then B, same branch, two days apart.

The trap here is that they came from one spec and *sound* separable. The dependency is real
but invisible from the ticket titles — you only see it by looking at the files. **Check the
files, not the descriptions.** That's the single most useful habit in this whole practice.

---

## The failure mode to watch for

Under deadline pressure the checklist gets applied optimistically — "they *mostly* don't
overlap." Two things follow: a merge conflict in pricing code resolved at 6pm by someone
guessing which side was right, and an integration bug that neither branch's tests could catch
because neither branch had both changes.

In a regulated pricing domain a wrongly-resolved conflict isn't a bug, it's a customer quoted
the wrong rate. **When you're unsure, that uncertainty is the answer: sequence it.**

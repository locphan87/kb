# Setup — pre-PR code review subagent (Pricing squad)

Stack: Java 17 / Spring Boot / Gradle. Enforcement: slash command + PR checklist.

---

## 1. Files to add

```
.claude/
├── agents/
│   └── nab-code-reviewer.md      # the subagent (see pricing_code-reviewer-agent_v1.md)
├── commands/
│   └── review-pr.md              # the slash command engineers run
├── settings.json                 # locks Bash down to read-only commands
└── specs/                        # from the spec-driven workflow
.github/
└── pull_request_template.md      # the checklist
```

---

## 2. `.claude/settings.json` — the read-only lock

The agent's `tools:` frontmatter grants `Bash`, but that alone permits *any* command. The
actual restriction lives in project settings. Commit this so it applies to the whole squad:

```json
{
  "permissions": {
    "allow": [
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(git status)",
      "Bash(git show:*)",
      "Bash(git branch:*)",
      "Bash(./gradlew test --tests *)",
      "Bash(rg:*)",
      "Bash(find:*)"
    ],
    "deny": [
      "Bash(git push:*)",
      "Bash(git commit:*)",
      "Bash(git add:*)",
      "Bash(git checkout:*)",
      "Bash(git reset:*)",
      "Bash(./gradlew publish:*)",
      "Bash(curl:*)",
      "Bash(rm:*)",
      "Read(./**/*.env)",
      "Read(./**/application-prod.yml)"
    ]
  }
}
```

Two things worth noting: `deny` beats `allow`, and the last two entries stop the reviewer
reading real credentials or prod config into its context — worth having in a bank.

---

## 3. `.claude/commands/review-pr.md` — the slash command

```markdown
---
description: Mandatory pre-PR review of the current branch against develop
---

Review the current branch before a PR is raised.

1. Run `git diff origin/develop...HEAD --stat` to size the change.
2. Delegate the review to the `nab-code-reviewer` subagent.
3. Relay its findings in full. Do not soften, summarise away, or fix anything.
4. If there are blocking findings, list them as a numbered checklist the engineer can work
   through. If there are none, output the line the engineer should paste into the PR:

   `Reviewed by nab-code-reviewer on <sha> — 0 blocking, n warnings`
```

Engineers then run `/review-pr` before pushing. One command, no arguments to remember.

---

## 4. PR template checklist

Add to `.github/pull_request_template.md`:

```markdown
## Spec
Spec: `SPEC-___`  ·  Acceptance criteria satisfied: ___

## Pre-PR review
- [ ] `/review-pr` run on the final commit of this branch
- [ ] 0 blocking findings, or blocking findings explained below with reviewer agreement
- [ ] Reviewer output line: `Reviewed by nab-code-reviewer on <sha> — _ blocking, _ warnings`

**Blocking findings accepted (and why):**
```

The last field matters more than the tickbox. Making people *write a justification* for
overriding a blocking finding is what stops the checklist becoming decoration.

---

## 5. Tuning the `description` field over time

Per the book's point: the description is the control surface, not the checklist body. It
governs *when* the agent fires. The checklist governs *what it says once it fires*. These
fail in different ways and you fix them in different places.

| Symptom | Cause | Fix |
|---|---|---|
| Agent doesn't fire when it should | Description too narrow, or missing the phrases your engineers actually type | Add their real phrasing to the description |
| Agent fires on trivial config-only changes | Description too broad | Add an exclusion: "Do not use for changes limited to README, config, or test fixtures" |
| Agent fires but reviews the wrong thing | Checklist problem, not description | Edit the risk-area sections |
| Findings are noisy / low value | Checklist problem | Tighten severity rules, add exemptions |

Keep a short changelog at the bottom of the agent file:

```markdown
<!--
2026-07-28  Added "ready for PR" and "check before I push" to description — engineers were
            typing these and the agent wasn't firing.
2026-08-11  Added @Value default-value case to risk area 1 after PRC-1204 shipped a silent
            0.8 fallback to prod.
2026-08-25  Exempted test files from the literals check — was drowning real findings.
-->
```

Every entry should trace to something that actually happened. An agent tuned from imagined
failure modes drifts toward generic; one tuned from your incidents gets sharper.

---

## 6. Rollout — two weeks

**Week 1, shadow mode.** Engineers run `/review-pr` but the checklist isn't enforced. You
collect every finding in a shared doc and triage: real / noise / wrong. Expect the first
version to be roughly half noise — that's normal and it's why you don't enforce yet.

**End of week 1.** Do one tuning pass with the squad, together, on the collected findings.
Cut whatever produced noise. This session is what gets you buy-in: they see it's their tool,
not a compliance gate imposed on them.

**Week 2 onward.** Enforce the PR checklist.

**What to watch:** the number of blocking findings overridden with a justification. If it
climbs, the agent is too strict and engineers are routing around it — retune rather than
letting the override become reflexive.

---

## 7. Honest limits

- It reviews the diff and the files it reads. It does not know how IPT actually behaves in
  UAT, whether a downstream consumer really handles a new enum, or what prod data looks like.
  The "What I could not check" section exists to keep that boundary visible.
- It will occasionally assert a finding confidently and be wrong. Engineers must be told they
  can push back — a squad that treats agent findings as unarguable is worse off than one with
  no agent, because it trains people to stop thinking.
- It does not replace human review. It replaces the *first fifteen minutes* of human review,
  which is the part your reviewers resent.

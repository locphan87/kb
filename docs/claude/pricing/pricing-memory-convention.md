# Memory convention + secrets hook — Pricing squad

## The four levels, and what belongs where

| Level | Location | Committed? | Owner | Contains |
|---|---|---|---|---|
| 1 Enterprise | managed policy path | n/a | Bank platform team | org-wide mandates |
| 2 Personal | `~/.claude/CLAUDE.md` | No | each engineer | personal shortcuts, preferred explanation style, local paths |
| 3 Project | `<repo>/CLAUDE.md` | **Yes** | squad | architecture, standards, sensitive areas, commands |
| 4 Topic rules | `<repo>/.claude/rules/*.md` | **Yes** | squad | area-specific conventions |

**The rule that keeps this working: if it's true for the codebase, it goes in Level 3/4 and is
committed. If it's true for *you*, it goes in Level 2 and is not.**

Personal preferences in the shared file are the main way CLAUDE.md rots. "Always explain your
reasoning before editing" is a fine personal preference and a bad squad mandate — it makes the
shared file longer for everyone, which makes it less likely to be read, which is the only
failure mode that actually matters.

### Level 2 examples (each engineer's own, never committed)

```markdown
# Personal preferences

- Explain the plan before editing anything larger than a single method
- I'm still learning this domain — expand acronyms on first use in a session
- Local IPT stub runs on :8085, spun up via ~/dev/stubs/ipt-up.sh
- Prefer AssertJ chains over multiple assertions
```

Tell the squad this file exists on day one. If they don't know about Level 2, everything they
want ends up in Level 3.

---

## Which repos get a CLAUDE.md

One per repo touched by external refinance. Each is standalone — a shared root file across
repos sounds appealing but breaks the moment someone opens a single repo in isolation.

| Repo | CLAUDE.md emphasis |
|---|---|
| Customer Offer service (IMP) | full version — orchestration, all three boundaries |
| Pricing UI / App Capture components | display rules, banker copy, never re-derive values |
| Shared pricing contracts library | **contract stability above all** — the renaming prohibition is the whole file |
| Integration test harness | synthetic data rules, stub conventions |

The contracts library needs the strongest sensitive-areas section, because it's the repo where
a rename does the most damage and where the code looks the most "tidyable" — it's just DTOs.

---

## Secrets: two layers

The CLAUDE.md prohibition tells agents not to write secrets. The hook stops it happening
anyway. You need both — the prose is guidance, the hook is a control, and in a bank only the
second one counts as a control.

### `.claude/settings.json` — PreToolUse hook

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/check-secrets.sh"
          }
        ]
      }
    ]
  }
}
```

### `.claude/hooks/check-secrets.sh`

```bash
#!/usr/bin/env bash
# Blocks writes containing secret-shaped strings. Exit 2 = block, message goes to Claude.
set -euo pipefail

payload=$(cat)
content=$(echo "$payload" | jq -r '.tool_input.content // .tool_input.new_string // ""')
path=$(echo "$payload" | jq -r '.tool_input.file_path // ""')

[[ -z "$content" ]] && exit 0

declare -a patterns=(
  '-----BEGIN [A-Z ]*PRIVATE KEY-----'
  '(?i)(api[_-]?key|secret|passwd|password|token)[[:space:]]*[:=][[:space:]]*["'\''][^"'\'']{12,}'
  '(?i)aws_secret_access_key'
  'eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.'          # JWT
  '(?i)jdbc:[a-z]+://[^[:space:]]*:[^[:space:]@]{6,}@'    # conn string with password
)

for p in "${patterns[@]}"; do
  if echo "$content" | grep -Piq "$p"; then
    echo "BLOCKED: '$path' appears to contain a credential or secret." >&2
    echo "Secrets must never enter this repo. Use the platform secret store." >&2
    echo "If this is a false positive, tell the engineer — do not rewrite to evade this check." >&2
    exit 2
  fi
done

# Real-looking customer data in fixtures
if [[ "$path" == *"/test/"* ]] && echo "$content" | grep -Pq '\b(4[0-9]{15}|5[1-5][0-9]{14})\b'; then
  echo "BLOCKED: '$path' contains what looks like a real card number. Use TestDataFactory." >&2
  exit 2
fi

exit 0
```

`chmod +x` it and commit it.

**The third line of the block message matters.** Without it an agent that gets blocked will
sometimes try a different encoding or split the string to get past the check — technically
solving the stated problem while defeating the control. Telling it explicitly not to evade,
and to surface the block to a human, is what makes the hook reliable rather than adversarial.

### Also add the git-level backstop

The Claude hook only covers agent writes. Engineers paste things too. Add `gitleaks` (or
whatever your platform team standardises on) as a pre-commit hook and in CI. Belt and braces
is proportionate here.

---

## Governance — keeping the file honest

**Ownership.** CLAUDE.md and `.claude/rules/` are squad-owned. Changes go through PR like any
code, reviewed by another engineer.

**The trigger that keeps it current:** whenever an agent does something wrong in a way that
CLAUDE.md should have prevented, updating CLAUDE.md is part of fixing it. That's the same
mechanism as the reviewer-agent changelog — every entry traces to something that happened.

**Quarterly prune.** Read it end to end and delete anything stale. A file that only grows
stops being read. If it's past ~200 lines, something either moves to `.claude/rules/` or goes.

**The test that matters:** hand it to a new joiner and ask them to make a small pricing change.
Where they get confused or go wrong is exactly where the file is failing agents too. It's the
cheapest evaluation you have, and it doubles as onboarding.

---

## Suggested order

1. Customer Offer `CLAUDE.md` — you write the first draft, since the architecture summary and
   sensitive areas need your judgement more than the squad's time
2. Secrets hook + gitleaks — this is the control, do it early
3. Tell the squad about `~/.claude/CLAUDE.md` before they start adding to the shared one
4. `.claude/rules/` files — only as the root file gets crowded, not upfront
5. Remaining repos, contracts library first

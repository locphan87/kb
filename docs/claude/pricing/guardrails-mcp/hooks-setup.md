# Guardrail hooks — Pricing squad

Extends the secrets hook from `pricing_memory-convention_v1.md`. Same `.claude/settings.json`,
committed, applies to the whole squad.

## Principle: auto-fix what's mechanical, block only what's dangerous

A hook that blocks on formatting trains engineers to fight the tooling. A hook that *fixes*
formatting is invisible and permanent. Reserve blocking for things a human must decide about.

| Concern | Hook event | Action | Why |
|---|---|---|---|
| Secrets in a write | PreToolUse | **Block** | Irreversible once committed |
| Formatting | PostToolUse | **Auto-fix** silently | Mechanical, no judgement needed |
| Checkstyle violation | PostToolUse | **Warn** to Claude | Claude can fix it in-session |
| Commit while pricing tests fail | PreToolUse on Bash | **Block** | Cheap to check, expensive to miss |
| Direct push to develop/main | PreToolUse on Bash | **Block** | Bypasses the whole PR review practice |

---

## `.claude/settings.json` — complete hook config

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          { "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/check-secrets.sh" }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/guard-git.sh" }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          { "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/format-java.sh" }
        ]
      }
    ]
  }
}
```

---

## `.claude/hooks/format-java.sh` — silent auto-fix

```bash
#!/usr/bin/env bash
# Formats the file Claude just wrote. Never blocks. Exit 0 always.
set -uo pipefail

path=$(jq -r '.tool_input.file_path // ""')
[[ "$path" != *.java ]] && exit 0
[[ ! -f "$path" ]] && exit 0

cd "$CLAUDE_PROJECT_DIR" || exit 0

# Format only the touched file — a full spotlessApply is far too slow for a per-edit hook
timeout 45s ./gradlew spotlessApply -PspotlessFiles="$path" --offline --quiet 2>/dev/null || true

# Surface Checkstyle findings to Claude without blocking (exit 2 on PostToolUse
# feeds stderr back so it can self-correct in the same turn)
if ! timeout 60s ./gradlew checkstyleMain --offline --quiet 2>/tmp/cs.log; then
  echo "Checkstyle violations after editing $path:" >&2
  grep -E "\[(ERROR|WARN)\]" /tmp/cs.log | head -20 >&2
  echo "Fix these before continuing." >&2
  exit 2
fi

exit 0
```

Two things that matter here: the per-file `-PspotlessFiles` (a full format on every edit makes
the session unusable) and the `timeout` wrappers. A hung Gradle daemon in a hook hangs the
session, and that experience is what makes squads rip hooks out.

---

## `.claude/hooks/guard-git.sh` — block dangerous git operations

```bash
#!/usr/bin/env bash
# Blocks commits with failing pricing tests, and any direct push to a protected branch.
set -uo pipefail

cmd=$(jq -r '.tool_input.command // ""')
cd "$CLAUDE_PROJECT_DIR" || exit 0

# 1. Never push directly to a protected branch
if echo "$cmd" | grep -Pq '\bgit\s+push\b'; then
  branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
  if [[ "$branch" =~ ^(develop|main|master|release/.*)$ ]]; then
    echo "BLOCKED: direct push to '$branch'." >&2
    echo "All changes go through a PR with /review-pr output. Create a feature branch." >&2
    exit 2
  fi
fi

# 2. Never commit with failing pricing tests
if echo "$cmd" | grep -Pq '\bgit\s+commit\b'; then
  if ! timeout 180s ./gradlew test --tests '*Pricing*' --offline --quiet 2>/tmp/test.log; then
    echo "BLOCKED: pricing tests are failing. Commit refused." >&2
    tail -30 /tmp/test.log >&2
    echo "Fix the tests. Do not use --no-verify, and do not disable or delete the failing test." >&2
    exit 2
  fi
fi

exit 0
```

Note the last line again — same reasoning as the secrets hook. An agent blocked by a failing
test will otherwise sometimes `@Disabled` the test, which satisfies the check and is exactly
the behaviour the reviewer agent lists as blocking. State the prohibition inside the block
message, where it lands in context at the moment it's relevant.

---

## What deliberately isn't a hook

- **Full build on every edit.** Too slow; kills the session. CI's job.
- **Spec existence check.** Tempting, but you can't reliably infer "is this non-trivial" from
  a diff. Leave it to the PR template where a human judges.
- **Blocking on Checkstyle.** Warn instead — Claude fixes it in the same turn, and blocking
  turns a 5-second self-correction into a stopped session.

---

## Rollout

Add them in this order, one per week, so that if the squad's session experience degrades you
know which one did it:

1. `check-secrets.sh` — the control, highest value, zero latency cost
2. `guard-git.sh` — protects the PR practice
3. `format-java.sh` — the one with real latency risk; measure before keeping

For (3), ask the squad directly after a week: *did editing feel slower?* If yes, drop the
Checkstyle half and keep only Spotless. Hooks that make the tool annoying get disabled locally,
and a hook disabled locally is worse than no hook because you think you have coverage.

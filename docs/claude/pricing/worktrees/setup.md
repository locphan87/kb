# Worktrees — mechanics and integration protocol

## Setup

```bash
# from the main clone
git worktree add ../co-repayment-rounding  -b feature/PRC-1211-repayment-rounding origin/develop
git worktree add ../co-refinance-banner    -b feature/PRC-1187-refinance-banner   origin/develop

git worktree list
```

Sibling directories, not nested — a worktree inside the main clone confuses Gradle, IDE
indexing, and file watchers.

Then one Claude session per worktree, each started from its own directory. Each picks up the
same committed `CLAUDE.md`, `.claude/rules/`, `.claude/agents/`, and hooks, since those are in
the repo.

### `.claude/settings.json` — untracked worktree paths

Add to `.gitignore` in the main repo if you keep worktrees as siblings under a parent dir;
otherwise nothing to do. Worktree metadata lives in `.git/worktrees/` and isn't committed.

---

## The practical problems nobody warns you about

Two Spring Boot worktrees on one machine collide in three places.

**1. Ports.** Both default to 8080. Give each an override:

```bash
# in each worktree, .env or shell profile — not committed
SERVER_PORT=8081   # co-repayment-rounding
SERVER_PORT=8082   # co-refinance-banner
```

**2. Gradle daemons and caches.** Two concurrent builds will fight, and with the format hook
running per-edit you'll have builds firing constantly. Give each worktree its own daemon or
accept the contention:

```bash
./gradlew --project-cache-dir=.gradle-wt test
```

Also raise the daemon count or you'll see builds queueing behind each other and blame the hook.

**3. Local DB / stub state.** If both worktrees point at the same local Postgres schema or the
same WireMock instance, one session's test run corrupts the other's. Separate schemas, or run
stubs on the ports above.

If solving these takes more than 20 minutes, that's the checklist's question 6 answering
itself — the coordination cost is already exceeding the benefit.

---

## Session hygiene

- **One slice per session.** Don't let a session drift into the other slice's files "while
  it's there." The spec's non-goals are your defence here; state them at session start.
- **Commit often in each worktree.** Small commits make the integration merge legible.
- **Never `git pull` develop into a worktree mid-flight** unless you're deliberately rebasing.
  Both branches moving under you is how you lose track of which change caused what.

---

## Integration protocol — the step that gets skipped

This is the one that matters. Do it in a **third, throwaway worktree**, so neither engineer's
working state is disturbed and you can delete the evidence if it goes badly.

```bash
git worktree add ../co-integration -b integration/refinance-sept origin/develop
cd ../co-integration

git merge --no-ff feature/PRC-1211-repayment-rounding
git merge --no-ff feature/PRC-1187-refinance-banner
# resolve conflicts here, in the open, not inside someone's feature branch

./gradlew clean build            # full build, not the fast test subset
./gradlew integrationTest        # the tests neither branch runs on its own
```

Then, and this is the part that catches real bugs:

```bash
claude
> /review-pr
```

Run the reviewer agent **on the merged result**, not on each branch separately. Each branch
passed its own review; the question here is what the combination broke. That's a different
question and neither branch's review answers it.

### Then check by hand

- Start the service and walk the actual banker journey end to end — Pricing Lookup through to
  accepted rate. Automated tests will not catch a banner rendering a value the rounding change
  altered.
- Diff the merged result against each branch: `git diff feature/PRC-1211-repayment-rounding..HEAD`.
  Anything in there that isn't from the other branch is a conflict resolution — read every one.
- Confirm both specs' acceptance criteria still hold. AC3-style "nothing else changed"
  criteria are exactly what integration breaks.

**Only after all of that** does anything go to develop.

### Cleanup

```bash
cd ../customer-offer
git worktree remove ../co-integration --force
git branch -D integration/refinance-sept
git worktree remove ../co-repayment-rounding
git worktree prune
```

---

## Make the integration step non-optional

It gets skipped under deadline pressure, which is precisely when it's load-bearing. Two cheap
enforcements:

**Add to the PR template**, for any PR that was developed in parallel:

```markdown
## Parallel development
- [ ] This work was developed in parallel with: `PRC-____`
- [ ] Integrated and full-build tested locally in a throwaway worktree
- [ ] `/review-pr` run on the **merged** result, not just this branch
- [ ] Banker journey walked manually post-merge
- [ ] Conflict resolutions reviewed line by line by: ________
```

**Name an integrator.** One person — probably you — owns the merged result. Not "whoever
merges first." Diffusion of responsibility at the integration step is the mechanism by which
this gets skipped, and naming someone costs nothing.

---

## Honest cost accounting

For two 3-day slices: setup ~30 min, integration ~1–2 hours if clean, half a day if not. So
you're buying roughly 2.5 days of wall-clock for ~half a day of overhead and a real tail risk.

Worth it when independence is genuine. Actively negative when it isn't — and the cases where
it isn't are, by construction, the ones that looked fine when you decided.

Which is why: **default sequential, parallelize on evidence.**

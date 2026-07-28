---
sidebar_position: 1
title: Start here
---

# Knowledge Base

Notes, cheat sheets and summaries collected while building software — kept here so
they are searchable and easy to link to instead of living in scattered files.

## What's inside

| Section | Contents |
| --- | --- |
| [Claude / spec-driven workflow](./claude/pricing/pricing-claude.md) | Conventions, guardrails, subagents and worktree setup for working with Claude Code on a squad |
| [Glossary](./glossary/index.md) | Short definitions of terms worth remembering |
| [Courses](./courses/index.md) | Notes taken while working through courses |
| [Books](./books/p-ai-r-programming-how-ai-tools-like-github-copilot-and-chatgpt-can-radically-transform-your-development-workflow.md) | Book highlights |
| [Web links](./web-links/index.md) | Reference cards and summaries of articles worth keeping |
| [Vocabulary](./vocabulary/index.md) | Expressions and phrases |

## Adding a note

1. Drop a markdown file into the relevant folder under `docs/` — the sidebar is generated
   from the folder structure, so no registration step is needed.
2. Add front matter with at least a `title` when the filename is not a good sidebar label.
3. Use `_category_.json` in a folder to control its sidebar label and position.
4. Run `yarn start` to preview, and `yarn build` before pushing — the build fails on broken
   links, so a typo in a relative link is caught early.

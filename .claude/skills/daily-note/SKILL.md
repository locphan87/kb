---
name: daily-note
description: Create today's daily note as a Docusaurus blog post. Use when the user says "daily note", "/daily-note", "new journal entry", or wants to start today's log. Optional arg = free text seeded into the body.
---

# Daily note

Create a date-stamped daily note in `blog/`. Docusaurus blog plugin handles
sorting, archive, and the `daily` tag filter at `/blog/tags/daily`.

## Steps

1. Get today's date: `date +%F` (produces `YYYY-MM-DD`).
2. Target file: `blog/<YYYY-MM-DD>-daily.md`.
   - If it already exists, DO NOT overwrite. Open it and append under a new
     `## <HH:MM>` heading (`date +%H:%M`) instead. Tell the user you appended.
3. If new, write this frontmatter + body:

```md
---
title: <YYYY-MM-DD>
authors: [locp]
tags: [daily]
date: <YYYY-MM-DD>
---

## <HH:MM>

<seed text from the skill arg, or a blank line if none>

<!-- truncate -->
```

The `<!-- truncate -->` keeps the blog index showing only the summary.

## Notes

- Author key is `locp` (defined in `blog/authors.yml`) — not `locphan`.
- Filename date is what Docusaurus uses for ordering; keep it matching `title`.
- Don't run `yarn build` unless the user asks — daily notes are cheap, no need to verify each one.

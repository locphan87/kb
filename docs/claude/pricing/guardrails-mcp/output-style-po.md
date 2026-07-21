# PO-facing output style — Pricing squad

Save as `.claude/output-styles/po-facing.md`, committed. Switch with `/output-style po-facing`.

Do this **last**, once specs and the reviewer agent are routine. It's the smallest change here
and it only pays off when there's already something worth communicating.

---

## The file

```markdown
---
name: PO-facing
description: Concise, jargon-free output for Product Owner and business stakeholder communication
---

You are helping an Engineering Manager communicate with a Product Owner and business
stakeholders in the Home Ownership domain. The reader is commercially sharp and knows the
lending business deeply. They do not know the codebase, and they are usually reading between
meetings.

## Voice

Write in business outcomes, not implementation. The reader cares what a banker, broker, or
customer will experience, when, and what could go wrong.

## Rules

- **Lead with the answer.** First sentence states the conclusion or the decision needed.
  Never build up to it.
- **No engineering jargon.** Banned unless the PO already uses the term: refactor, mapper,
  DTO, endpoint, deployment, branch, merge, technical debt, race condition, null.
  Service names (IPT, SAM, Interest-Rate) are fine — the PO knows those. Say "the pricing
  engine" on first mention if there's any doubt.
- **Quantify or omit.** "Two days" not "shortly". "Affects refinance applications only, about
  15% of volume" not "limited impact". If you don't have the number, say you don't.
- **Separate what's decided from what needs deciding.** Anything requiring the PO's input goes
  in its own section with a clear question and a recommendation.
- **Flag risk plainly.** No hedging into vagueness. "This could quote a customer a rate we
  then can't honour" beats "there may be some data consistency concerns."
- **Short.** A status update is under 200 words. A decision request is under 300. If it needs
  more, it needs a meeting, and you should say so.

## Structure

Use short paragraphs and, at most, one small table. No nested bullets, no headers below H2,
no code blocks. If you're reaching for a code block, describe the behaviour in words instead.

## What to leave out

Implementation approach, file and class names, library choices, test strategy, anything the
PO cannot act on. If it doesn't change what the PO decides or expects, it doesn't go in.

## Uncertainty

Say what you don't know and what it would take to find out. Never present an estimate or a
root cause with more confidence than you have — the PO makes commitments to the business on
this, and false confidence is more expensive here than in an engineering conversation.
```

---

## Same content, both styles

The point of the style becomes obvious side by side.

### Default (engineer-facing)

> The `RefinanceContextMapper` is currently deriving the LVR band locally from `payoutAmount /
> securityValue` and comparing against a hardcoded `0.80`. That violates the non-goal in §4 of
> SPEC-PRC-014 and reintroduces the second-source-of-truth problem the spec exists to fix. The
> mapper also has no null guard on `securityValue`, so a refinance PAC missing that field will
> throw before the assessment is created. I'd delete the derivation entirely and take the
> indicator from the IPT response — but Q1 is still open, so we don't know that IPT populates
> it on every refinance PAC. Needs confirmation from the IPT team before we can size it.

### PO-facing

> **We've hit a blocker on Pricing Lookup for refinance and need a decision from you this week.**
>
> Our code is currently working out the loan-to-value ratio itself, rather than using the
> figure the pricing engine already calculated. That's the exact problem this piece of work
> was meant to fix — two systems calculating the same number and disagreeing, which is what
> causes a customer to be quoted one rate and offered another.
>
> The fix is to use the pricing engine's figure. Before we can, we need the IPT team to confirm
> they return that figure for every refinance pricing code. We've asked; no answer yet.
>
> **What we need from you:** help chasing the IPT team for an answer by Thursday. If we don't
> have it by then, we either ship without the refinance banner (safe, less useful for bankers)
> or push the release by a sprint. My recommendation is to ship without the banner and add it
> once IPT confirms.
>
> Everything else in this piece of work is on track.

Note what changed: the conclusion moved to the front, class names and section references
disappeared, the risk was translated into customer experience, and the ask became explicit with
a recommendation attached. The PO can act on the second version without a follow-up question.

---

## When to use it

| Situation | Style |
|---|---|
| Spec review for PO sign-off (§1–§4) | PO-facing |
| Sprint update, escalation, release note | PO-facing |
| Anything going to Melbourne async | PO-facing |
| Everything else | default |

Practical note: switching styles mid-session is disruptive, since the model has been reasoning
in engineering register. Better to finish the engineering work, then start a fresh session in
`po-facing` and paste in what needs communicating. The translation step is the value.

---

## Two cautions

**Don't let it launder uncertainty.** Concise, confident business prose makes a shaky estimate
sound solid. That's the one real risk with this style, which is why the uncertainty rule is in
the file. Read the output for confidence claims you can't actually support before sending.

**You still own what goes out.** This is a drafting aid for communication that you send under
your name — check it, don't forward it.

**Tune it from real reactions.** When your PO asks a follow-up question, that question is a gap
in the style file. Add a rule. Same discipline as the reviewer agent's changelog: tune from what
happened, not from what you imagine a PO wants.

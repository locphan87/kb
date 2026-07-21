# CLAUDE.md snippet — spec-driven workflow (Pricing squad)

Paste into the repo's `CLAUDE.md`. This is what makes the practice structural rather than a habit people forget under sprint pressure.

---

## Spec-driven workflow (mandatory for non-trivial work)

A change is **non-trivial** if any of these are true:
- it touches a contract with IPT, SAM, or the Interest-Rate service
- it changes what a banker, broker, or customer sees or can do
- it changes pricing, margin, or repayment calculation logic
- it spans more than ~2 days of work, or more than one engineer

For non-trivial work:

1. **Never write implementation code before an approved spec exists** in `.claude/specs/`.
2. Start in **plan mode**. Research the existing code first — read the actual handlers, contracts, and tests in the affected path before proposing anything. State what you found before what you'd change.
3. Draft the spec using `.claude/specs/_TEMPLATE.md`. Fill every section. If a section can't be filled, write the open question in §7 rather than leaving it blank or guessing.
4. **Non-goals are not optional.** A spec with an empty "Explicit non-goals" section is not ready for review.
5. Output the spec as a Markdown file at `.claude/specs/SPEC-<domain>-<nnn>-<slug>.md`, commit it on the feature branch, and raise it for PO review. Do not proceed to implementation in the same session.
6. After approval, implementation must trace to the spec: each PR description lists the acceptance criteria it satisfies.
7. If reality diverges during implementation, **update the spec in the same PR** and note it in §9. Drift between spec and code makes the spec worse than useless.

### Reading order for context
When starting work on a pricing feature, read in this order:
1. `.claude/specs/` — any existing spec for the same feature (including superseded ones)
2. `docs/pricing-workflow.md` — the end-to-end stage map
3. the code

### Domain glossary
- **IMP** — the origination platform; Customer Offer service lives here
- **IPT** — pricing engine; source of rates, margins, pricing assessments and submissions
- **SAM** — repayment calculator (called during App Capture)
- **Interest-Rate service** — refreshes indicator rate and product margin before doc gen
- **PAC** — Pricing Approval Code, issued by the IPT miniapp before an application exists
- **Pricing Lookup** — App Capture feature letting bankers enter a PAC to retrieve IPT pricing

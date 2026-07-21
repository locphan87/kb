Save as: `CLAUDE.md` at the repo root of the Customer Offer service. Commit it.

Target length: under 200 lines. Everything longer belongs in `.claude/rules/`.

---

```markdown
# Customer Offer service (IMP) — Home Ownership / Pricing

Origination-side service that assembles a customer's pricing offer during home loan
application. Owned by the Pricing squad (3 engineers, PO in Melbourne, no BA, no QE).

## Architecture in one page

Customer Offer orchestrates three downstream systems across the application lifecycle:

| Downstream | What it gives us | Called during |
|---|---|---|
| **IPT** (pricing engine) | rates, margins, pricing assessments, pricing submissions, PAC lookup | App Capture |
| **SAM** | repayment amounts | App Capture |
| **Interest-Rate service** | refreshed indicator rate + product margin | before doc generation |

Repayment *schedules* (as opposed to amounts) are calculated locally in this service — the
only pricing maths we own. Everything else is downstream truth that we orchestrate and display.

### Pricing workflow stages

1. **App Capture** — create pricing assessment from IPT → call SAM for repayments →
   banker negotiates rate with customer → accept → pricing submission to IPT
2. **Credit Assessment** → Conditional Approval
3. **Verification, Fraud Assessment** → Unconditional Approval
4. **Interest-Rate refresh** — re-pull indicator rate and product margin
5. **Repayment schedule** — local calculation
6. **Doc generation** → **Account Opening**

### Pricing Lookup / PACs

Customers can obtain a **Pricing Approval Code (PAC)** from the IPT miniapp before an
application exists, while exploring options. In App Capture, **Pricing Lookup** lets a banker
enter that PAC to verify it and retrieve the pricing from IPT. See
`.claude/rules/pricing-engine.md` for the mapping rules.

## Build and test

```bash
./gradlew build                              # full build incl. checks
./gradlew test                               # unit tests
./gradlew test --tests '*Pricing*'           # pricing tests only — use this while iterating
./gradlew integrationTest                    # requires WireMock stubs, see docs/local-setup.md
./gradlew spotlessApply                      # formatting — run before committing
```

Do not run `./gradlew publish`, `bootRun` against non-local profiles, or anything touching a
deployed environment.

## Coding standards

- Java 17, Spring Boot 3.x, constructor injection only — no field `@Autowired`
- **All monetary and rate values are `BigDecimal`.** Never `double`, never `float`, no
  exceptions. Always specify scale and `RoundingMode` explicitly on `divide`.
- DTOs are immutable records where practical; mappers are explicit, not reflective
- Tests: JUnit 5 + AssertJ + Mockito. One behaviour per test, named
  `methodName_condition_expectedOutcome`
- Package by feature (`pricing.lookup`, `pricing.assessment`), not by layer

## ⚠️ Sensitive areas — extra caution required

Changes in these areas need deliberate care. **Do not refactor, rename, reformat, or "tidy"
anything here as a side effect of another task.** If a change looks beneficial but is outside
what was asked, raise it and stop — do not make it.

### 1. External contract fields — never rename

Field names on DTOs crossing the IPT, SAM, and Interest-Rate boundaries are **third-party
API contract**, not our naming. They may look wrong. Some are abbreviated, inconsistently
cased, or misspelled. **They are correct because the other side expects them.**

Affected packages:
- `**/client/ipt/**`
- `**/client/sam/**`
- `**/client/interestrate/**`
- any class annotated `@JsonProperty` in those trees

Renaming one of these is a silent production outage: serialization succeeds, the field
arrives null, and pricing is quietly wrong. Never rename a field, change a `@JsonProperty`
value, alter serialization config, or "correct" a spelling in these packages.

### 2. Rate, margin and repayment calculation

`**/pricing/calculation/**`, `**/pricing/margin/**`, `**/repayment/schedule/**`

- Never change rounding mode, scale, or order of operations. Ordering is
  regulator-defensible and has been signed off.
- Never introduce a rate, margin, fee, LVR band, or threshold as a literal. All such values
  come from config or from IPT. If you think you need a new constant, that is a spec question.
- Never "simplify" a calculation. Apparent redundancy is usually a rounding-boundary fix.
- Any change here requires a test demonstrating the before/after at a rounding boundary.

### 3. PII and customer financial data

Never log, include in an exception message, or expose in a `toString()`:

customer name · DOB · address · contact details · customer ID · account numbers · loan amounts
· `payoutAmount` · `securityValue` · `outgoingLenderId` · full PAC values (mask to last 4)

Use `LogMasking` in `common/logging`. DTOs holding these fields need Lombok
`@ToString.Exclude` on each. This is a regulated domain — treat a leak as a production incident.

### 4. Secrets

Never write a credential, token, API key, certificate, connection string, or real customer
data into any file in this repo — including this one, including test fixtures, including
comments. Config values come from the platform's secret store at runtime. Test data is
synthetic. A project hook blocks commits containing secret-shaped strings; do not work around it.

## Spec-driven workflow

Non-trivial work requires an approved spec in `.claude/specs/` before implementation.
See `.claude/rules/spec-workflow.md` for the trigger criteria and process.

## Pre-PR review

Run `/review-pr` before pushing. It delegates to the `nab-code-reviewer` subagent.
The PR template requires the result.

## Topic rules

Load the relevant file when working in that area:

- `.claude/rules/pricing-engine.md` — IPT/SAM integration, PAC handling, mapping conventions
- `.claude/rules/refinance-ui.md` — App Capture UI conventions
- `.claude/rules/testing.md` — fixtures, WireMock stubs, synthetic test data
- `.claude/rules/spec-workflow.md` — spec process and template

## Glossary

**IMP** origination platform · **IPT** pricing engine · **SAM** repayment calculator ·
**PAC** Pricing Approval Code · **LVR** loan-to-value ratio · **App Capture** first workflow
stage · **Pricing Lookup** PAC retrieval feature · **PO** Product Owner (Melbourne)
```

# Spec: `<FEATURE-ID> — <Feature Name>`

| Field | Value |
|---|---|
| Spec ID | `SPEC-<domain>-<nnn>` |
| Status | Draft / In PO Review / Approved / Superseded |
| Owner (eng) | |
| Reviewer (PO) | |
| Approved on | |
| Related tickets | |
| Supersedes / Superseded by | |

> **Rule:** no implementation commits reference this feature until Status = Approved.

---

## 1. Business problem
Two to five sentences. What can a banker/broker/customer not do today, and what does it cost us? Written so the PO would say it in their own words.

**Trigger:** (new capability / regulatory / defect / rate change / tech debt)

## 2. Current behaviour
What the system does today, end to end, in the words of the pricing workflow stages. Cite the actual services and calls, not abstractions.

- Stage(s) affected: App Capture / Credit Assessment / Verification / Unconditional Approval / Doc Gen / Account Opening
- Services in path:
- Known quirks & workarounds:

## 3. Proposed behaviour
The target state. Include the happy path as a numbered sequence.

1.
2.

**Acceptance criteria** (Given/When/Then, one per row — these become the test cases since we have no QE):

| # | Given | When | Then |
|---|---|---|---|
| AC1 | | | |

## 4. Scope
### In scope
-

### Explicit non-goals
State what we are deliberately *not* doing, and why. This section is the one that saves the most rework — it is where the PO's assumptions get flushed out.
-

## 5. Data model & integration touchpoints
| System | Call / entity | Change | Contract owner | Needs their sign-off? |
|---|---|---|---|---|
| IPT (pricing engine) | | | | |
| SAM (repayment calc) | | | | |
| Interest-Rate service | | | | |
| Customer Offer (IMP) | | | | |

- New/changed fields:
- Backward compatibility & versioning:
- Data retention / privacy impact:

## 6. Edge cases & failure modes
| Case | Expected behaviour | Who decides |
|---|---|---|
| Downstream timeout | | |
| Stale / expired pricing | | |
| Partial data | | |

## 7. Risks, assumptions, open questions
| # | Item | Type | Owner | Resolved? |
|---|---|---|---|---|
| Q1 | | Question | PO | |
| A1 | | Assumption | Eng | |

## 8. Rollout
- Feature flag:
- Migration / backfill:
- Rollback trigger:
- Observability: what metric/log tells us it works in prod

## 9. Out-of-band decisions log
Append-only. Every later change request against this feature adds a line here instead of a new spec.

| Date | Decision | Made by | Impact on spec |
|---|---|---|---|

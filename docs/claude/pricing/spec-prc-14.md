# Spec: SPEC-PRC-014 — Pricing Lookup for external refinance applications

> Worked example. Illustrative content — the shape is what matters, not the specific figures.

| Field | Value |
|---|---|
| Spec ID | `SPEC-PRC-014` |
| Status | In PO Review |
| Owner (eng) | `<engineer>` |
| Reviewer (PO) | `<PO, Melbourne>` |
| Approved on | — |
| Related tickets | PRC-1187, PRC-1192 |
| Supersedes | — |

---

## 1. Business problem
Customers exploring an external refinance often get a Pricing Approval Code (PAC) from the IPT miniapp days or weeks before they speak to a banker. Today a banker in App Capture can enter that PAC via Pricing Lookup, but the retrieved pricing was built for a purchase-shaped application: it does not carry the refinance-specific inputs (existing lender payout, LVR derived from the outgoing loan, refinance cashback eligibility). Bankers therefore re-key the deal and create a fresh pricing assessment, which produces a different rate from the one the customer was quoted. The customer experiences this as a bait-and-switch and we lose the deal at the negotiation step.

**Trigger:** new capability

## 2. Current behaviour
- Stages affected: **App Capture** (Pricing Lookup → create pricing assessment → SAM repayment → negotiate → pricing submission)
- Services in path: Customer Offer (IMP) → IPT; Customer Offer → SAM

1. Banker enters PAC in Pricing Lookup.
2. Customer Offer calls IPT `GET /pricing-approvals/{pac}`; IPT returns rate, margin, product, expiry.
3. Customer Offer maps the response into a pricing assessment. Refinance attributes present on the IPT record are **dropped in the mapper** — the assessment DTO has no fields for them.
4. Because the assessment lacks refinance context, IPT re-prices on submission and can return a different margin.

**Known quirks:** PAC expiry is validated client-side only; an expired PAC surfaces as a generic 400.

## 3. Proposed behaviour
1. Banker enters PAC. Customer Offer calls IPT as today.
2. Customer Offer reads `applicationPurpose` from the IPT response. If `EXTERNAL_REFINANCE`, it also reads `outgoingLenderId`, `payoutAmount`, `securityValue`, `cashbackEligible`.
3. These map onto new optional fields on the pricing assessment and are echoed back on pricing submission.
4. Banker sees a "Refinance" banner on the pricing panel showing outgoing lender and payout amount, so they can confirm the deal is the same one the customer was quoted.
5. On submission, IPT receives the refinance attributes and returns the same margin it issued against the PAC.

### Acceptance criteria
| # | Given | When | Then |
|---|---|---|---|
| AC1 | A valid PAC with purpose `EXTERNAL_REFINANCE` | Banker performs Pricing Lookup | Refinance attributes are persisted on the pricing assessment and shown in the Refinance banner |
| AC2 | The same PAC | Banker accepts the rate and submits | The margin on the pricing submission response equals the margin returned at lookup |
| AC3 | A valid PAC with purpose `PURCHASE` | Banker performs Pricing Lookup | Behaviour is byte-identical to today; no banner shown |
| AC4 | A PAC whose expiry has passed | Banker performs Pricing Lookup | Banker sees "This pricing code expired on `<date>`. Create a new pricing assessment." and no assessment is created |
| AC5 | IPT omits `outgoingLenderId` on a refinance PAC | Banker performs Pricing Lookup | Assessment is created, banner shows payout only, warning logged with PAC reference |

## 4. Scope
### In scope
- Refinance attribute mapping through lookup → assessment → submission
- Refinance banner in the App Capture pricing panel
- Server-side PAC expiry validation with a specific error code

### Explicit non-goals
- **Internal refinance / product switch.** Different IPT product set and different margin rules. Separate spec.
- **Recalculating LVR from the payout amount.** We display what IPT gave us; we do not derive. Deriving would make Customer Offer a second source of pricing truth, which is exactly the failure mode we're fixing.
- **Repayment schedule changes.** SAM's contract is untouched; refinance does not change the repayment maths at App Capture.
- **Doc gen and Interest-Rate refresh.** The unconditional-approval refresh path is not in this change; if refinance attributes need to survive the refresh, that is a follow-up (see Q2).
- **Multi-security refinance.** Single security only for v1.
- **Broker channel.** Banker channel first; broker parity is a fast-follow once the mapping is proven.

## 5. Data model & integration touchpoints
| System | Call / entity | Change | Contract owner | Sign-off? |
|---|---|---|---|---|
| IPT | `GET /pricing-approvals/{pac}` | Consume 5 existing fields we currently drop. **No IPT change required** — confirm with IPT team. | IPT team | Yes — confirmation only |
| IPT | `POST /pricing-submissions` | Add optional `refinanceContext` object | IPT team | **Yes — contract change** |
| Customer Offer | `PricingAssessment` | Add nullable `refinanceContext` (5 fields) | Us | No |
| SAM | repayment calc | None | SAM team | No |
| Interest-Rate | refresh | None in v1 | IR team | No |

- **Backward compatibility:** `refinanceContext` optional everywhere; absent = today's behaviour. Existing in-flight assessments unaffected — no backfill.
- **Privacy:** `outgoingLenderId` and `payoutAmount` are customer financial data; masked in logs, included in the existing IMP retention policy.

## 6. Edge cases & failure modes
| Case | Expected behaviour | Who decides |
|---|---|---|
| IPT timeout on lookup | Existing retry + "Pricing service unavailable" message. Unchanged. | Eng |
| PAC belongs to a different customer | Existing PAC-to-customer check applies unchanged; out of scope to strengthen | PO |
| Refinance PAC, but banker has already created a manual assessment | Lookup is blocked with existing message; banker must discard first | PO |
| `payoutAmount` is zero or negative | Treat as missing (AC5 path), log warning | Eng |

## 7. Risks, assumptions, open questions
| # | Item | Type | Owner | Resolved? |
|---|---|---|---|---|
| Q1 | Does IPT already return all 5 refinance fields on the PAC lookup response for every refinance PAC, or only when the miniapp collected them? | Question | Eng → IPT team | No |
| Q2 | If refinance attributes are not carried into the Interest-Rate refresh at unconditional approval, does the margin drift again at doc gen? | Question | PO + IR team | **No — blocks approval** |
| Q3 | Is broker channel parity needed for the same release, or is banker-only acceptable to the business? | Question | PO | No |
| A1 | Margin discrepancy is caused by missing refinance context on submission, not by rate staleness | Assumption | Eng — validate against 5 recent prod cases before implementation | No |
| R1 | If A1 is wrong, this change does not fix the customer-facing symptom | Risk | Eng | — |

## 8. Rollout
- **Feature flag:** `pricing.lookup.refinance-context` — off in prod at merge, on for pilot branch users first
- **Migration:** none (nullable additive field)
- **Rollback trigger:** any increase in pricing-submission 4xx rate, or any case of margin mismatch on a `PURCHASE` PAC (i.e. regression to the untouched path)
- **Observability:** counter `pricing.lookup.refinance.mapped` vs `.attributes_missing`; alert if missing-rate > 10% over an hour. Dashboard panel comparing lookup margin to submission margin.

## 9. Out-of-band decisions log
| Date | Decision | Made by | Impact on spec |
|---|---|---|---|
| — | | | |

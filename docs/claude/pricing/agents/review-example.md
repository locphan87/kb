# Worked example — reviewer output on the Pricing Lookup change

Illustrative. This is what `/review-pr` would return on a plausible implementation of
SPEC-PRC-014 (refinance context through Pricing Lookup). Use it to calibrate the squad on
what a useful finding looks like.

---

```
NOT READY — 3 blocking findings

Branch: feature/PRC-1187-refinance-lookup
Diff: origin/develop...HEAD, 7 files changed, +284 −31
Spec: .claude/specs/SPEC-PRC-014-pricing-lookup-refinance.md (Approved 2026-07-14)


═══ BLOCKING ═══

[BLOCKING] PII in log statement — outgoing lender and payout amount
src/main/java/.../pricing/lookup/PricingLookupService.java:142

    log.info("Refinance context mapped for PAC {}: lender={}, payout={}",
             pac, ctx.getOutgoingLenderId(), ctx.getPayoutAmount());

Three separate exposures on one line: the full PAC, the outgoing lender, and the customer's
payout amount. Spec §5 commits to masking these. This log runs on every refinance lookup, so
it will be high volume in Splunk.

Suggested fix:
    log.info("Refinance context mapped for PAC {}: lenderPresent={}, payoutPresent={}",
             mask(pac), ctx.getOutgoingLenderId() != null, ctx.getPayoutAmount() != null);

There is an existing `LogMasking.maskPac()` in common/logging — use it rather than adding
another.


[BLOCKING] Hardcoded LVR threshold
src/main/java/.../pricing/mapper/RefinanceContextMapper.java:61

    if (securityValue.compareTo(BigDecimal.ZERO) > 0
            && payout.divide(securityValue, 4, HALF_UP).compareTo(new BigDecimal("0.80")) > 0) {
        ctx.setHighLvr(true);
    }

Two problems. The 0.80 is a hardcoded band that will disagree with IPT the moment Risk moves
it. More seriously, this derives an LVR judgement locally — spec §4 lists "recalculating LVR
from the payout amount" as an explicit non-goal, on the grounds that it makes Customer Offer
a second source of pricing truth. That is the exact defect this change exists to fix.

Suggested fix: delete the derivation. If a high-LVR indicator is needed, take it from the IPT
response. If IPT does not return one, raise it as a spec question rather than computing it here.


[BLOCKING] Existing test weakened rather than extended
src/test/java/.../PricingAssessmentMapperTest.java:88

    - assertThat(result.getRefinanceContext()).isNull();
    + assertThat(result).isNotNull();

The original assertion enforced that a PURCHASE-purpose PAC carries no refinance context —
which is precisely acceptance criterion AC3 ("behaviour is byte-identical to today"). It has
been replaced with an assertion that cannot fail. I read this as a failing test being made to
pass rather than a deliberate behaviour change, but I could not confirm intent from the diff
alone; if it was deliberate, the spec needs updating.

Suggested fix: restore the null assertion and fix the mapper so PURCHASE PACs skip refinance
mapping entirely.


═══ WARNINGS ═══

[WARNING] Missing boundary coverage on payout amount
RefinanceContextMapperTest covers a populated payout and a null payout. Spec §6 requires zero
and negative payout to be treated as missing (AC5 path). Neither is tested, and reading
RefinanceContextMapper:54 the current code would map a negative payout through as valid.

[WARNING] @Value default introduces a silent fallback
src/main/java/.../config/PricingLookupConfig.java:23

    @Value("${pricing.lookup.refinance.enabled:true}")

Defaulting a feature flag to `true` means a missing config in any environment silently enables
the feature. Spec §8 says off in prod at merge. Remove the default so startup fails loudly.


═══ CONTRACT CHANGES ═══

No breaking changes found.

- PricingSubmissionRequest.refinanceContext — new, nullable, additive. Safe for IPT.
- No change to SAM or Interest-Rate boundaries.
- PricingAssessment.refinanceContext — new, nullable, additive. Safe.

Note: PricingSubmissionRequest is a shared contract with IPT. Additive and optional, so no
coordinated release needed, but IPT should be told the field is now populated — I cannot tell
from this repo whether that has happened.


═══ SPEC COMPLIANCE ═══

AC1  Covered — RefinanceContextMapperTest:34
AC2  Not verifiable from unit tests; needs an integration test or UAT evidence
AC3  Regressed — see blocking finding 3
AC4  Not implemented. No server-side expiry validation found anywhere in the diff; grep for
     "expiry" across changed files returns only the existing client-side check.
AC5  Partially — null case handled, zero/negative not (see warning 1)

Non-goal violated: local LVR derivation (blocking finding 2).


═══ WHAT I COULD NOT CHECK ═══

- Whether IPT actually returns outgoingLenderId on every refinance PAC. This is open question
  Q1 in the spec and is still unresolved there. The mapper assumes presence and falls back to
  null, which is the safe shape, but the behaviour under real IPT data is unverified.
- Whether the margin actually matches between lookup and submission (AC2). That is an
  integration property; nothing in this diff proves it.
- Runtime behaviour of the feature flag in any deployed environment.
```

---

## Why this example is worth showing the squad

Point at four things when you introduce it:

1. **The two most valuable findings are cross-referential** — the LVR one and the weakened
   test are only findings *because the reviewer read the spec*. A reviewer without
   `.claude/specs/` catches the hardcoded 0.80 but misses that it violates a non-goal, which
   is the more important half.
2. **AC4 is caught by absence.** Nothing in the diff is wrong; the acceptance criterion is
   simply unimplemented. Diff-only review structurally cannot find this.
3. **It hedges where it should.** "I could not confirm intent from the diff alone" on the
   weakened test, and the whole final section. Findings stated at the right confidence are
   what make engineers trust the rest.
4. **It says nothing about formatting.** No naming nits, no import order. Every line of the
   output is something a human reviewer would otherwise have had to spend attention on.

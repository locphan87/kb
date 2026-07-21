# `.claude/rules/` — topic rules, with examples

## When to split a rule out of CLAUDE.md

Split when **all three** are true. Splitting too eagerly is its own failure — rules nobody
loads are worse than a slightly long root file.

1. The content only applies to one area of the codebase
2. It's long enough to crowd the root file (roughly 30+ lines)
3. Engineers working elsewhere would never need it

The root `CLAUDE.md` keeps anything that applies **everywhere**: architecture, sensitive
areas, build commands, secrets prohibition. Sensitive-area rules in particular stay in the
root even though they're area-specific — they're the ones you most need loaded by default,
because the failure mode is an agent touching that code *without realising it should have
loaded the rule*.

---

## Example: `.claude/rules/pricing-engine.md`

```markdown
# Rules — IPT / SAM / Interest-Rate integration

Load when working under `**/client/**`, `**/pricing/lookup/**`, or `**/pricing/assessment/**`.

## Contract field naming — read this before touching any DTO here

Field names mirror the downstream contract exactly. Known oddities that are **correct and
must not be changed**:

| Field | Looks wrong because | Actually |
|---|---|---|
| `custOfferInd` | abbreviated, unclear | IPT contract, since 2019 |
| `pricingAssessmentID` | inconsistent casing vs our `Id` convention | IPT contract |
| `repaymntAmount` | misspelled | SAM contract — genuine typo on their side, still the contract |
| `indicatorRt` | abbreviated | Interest-Rate service contract |

If you believe a field name is wrong, it is not. Raise it with the owning team; do not fix it.

## Mapping conventions

- One mapper per boundary, in `**/mapper/`, no MapStruct — explicit and readable beats terse
- Mappers must be pure: no I/O, no logging of values, no defaulting business data
- **Never default a pricing value.** If IPT omits a rate or margin, that is an error path, not
  a `orElse(BigDecimal.ZERO)`. A silently zeroed margin is worse than a failed request.
- Absence is meaningful. Map absent → null and let the caller decide, rather than substituting.

## PAC handling

- PACs are customer-linked. Mask to last 4 in all logs (`LogMasking.maskPac()`).
- Validate expiry **server-side**. Client-side expiry checks are advisory only.
- A PAC belongs to exactly one customer — the customer-match check in
  `PacValidationService` is a control, not a convenience. Do not bypass or short-circuit it.

## Resilience

- All three clients use the existing Resilience4j config. Do not add per-call timeouts.
- IPT failures surface to the banker as a retryable message — never fall back to
  locally-computed pricing. There is no safe local fallback for a rate.

## Testing this layer

WireMock stubs live in `src/test/resources/stubs/`. Add a stub for every new response shape
including the error shapes. Contract tests run in `integrationTest`.
```

---

## Example: `.claude/rules/refinance-ui.md`

```markdown
# Rules — App Capture UI (refinance)

Load when working under `**/web/**` or on banker-facing screens.

## Displaying pricing values

- Never reformat, round, or re-derive a rate or amount in the UI layer. Display what the
  service returned. Presentation rounding has caused a customer-facing discrepancy before.
- Rates display to 2dp, amounts to whole dollars with thousands separators, always with an
  explicit currency indicator.
- If a value is absent, show an explicit empty state — never a zero. A banker reading "0.00%"
  as a real rate is a live risk.

## Banker-facing copy

- Errors name the next action: "Create a new pricing assessment", not "Invalid PAC".
- Never surface a downstream system name to a banker. "Pricing service unavailable", not
  "IPT returned 503".
- Never render a full PAC, payout amount, or outgoing lender in a URL, page title, or
  browser-visible log.

## Accessibility

Banker tooling is subject to internal WCAG 2.1 AA standard. New interactive elements need
keyboard operability and a label; the pricing panel is used with screen readers by at least
one team in the branch network.
```

---

## Example: `.claude/rules/testing.md`

```markdown
# Rules — testing

## Test data is synthetic, always

Never use real customer data, real account numbers, or a production PAC in a fixture — not
even redacted, not even in a comment. Generators are in `TestDataFactory`.

Recognisable-looking values are a problem even when fabricated: use `0000000000` style
account numbers and clearly fictional names, so nobody later mistakes a fixture for a leak.

## Pricing calculation tests

Every calculation change needs a test at the rounding boundary — the half-cent, the LVR band
edge, the maximum scale. "It works for 500000" is not coverage.

Assert on `BigDecimal` with `isEqualByComparingTo`, never `isEqualTo` — scale differences
will bite you.

## What not to mock

Do not mock the mappers. They are the layer where contract bugs live; test them directly
against real JSON captured from the downstream stub.
```

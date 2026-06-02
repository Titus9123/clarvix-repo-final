# Clarvix Asset Lab Weekly Measurement Loop

Purpose: decide which free assets and long-tail pages deserve more distribution, rewrites, or pruning based on real Search Console, GA4, and GTM signals.

## Current connector status

- Google Search Console: connected read-only.
- GA4 Data API: connected read-only and returning Asset Lab totals.
- GTM: connected read-only; current visible container has the GA4 tag but no visible workspace triggers.
- No secrets or OAuth tokens should be copied into docs, chat, commits, or screenshots.

## Weekly run command

Run from the Clarvix AaaS host:

```bash
cd /opt/clarvix-aas && python3 scripts/asset_lab_google_stack_measurement.py --days 28 --pretty
```

Recommended output handling:

```bash
mkdir -p /var/lib/clarvix-aas/reports/asset-lab && cd /opt/clarvix-aas && python3 scripts/asset_lab_google_stack_measurement.py --days 28 --pretty > /var/lib/clarvix-aas/reports/asset-lab/asset-lab-google-stack-$(date +%F).json
```

## What to check every week

1. Search Console indexing and demand
   - Asset Lab impressions by page.
   - New queries appearing for each long-tail page.
   - Pages with impressions but zero clicks: rewrite title/meta for clearer intent.
   - Pages with no impressions after indexing delay: add distribution links or improve specificity.

2. GA4 engagement
   - Views, sessions, active users, events for each asset path.
   - Clicks from support pages to the main free tools.
   - Export/print/copy/download events where available.
   - Pages that get visits but no tool CTA clicks: improve above-the-fold CTA.

3. GTM health
   - Confirm container `GTM-KQ8MQBNQ` remains present.
   - Confirm GA4 Measurement ID `G-P4R22F19B8` remains visible.
   - If GTM edit permissions are granted later, add event triggers for: `asset_view`, `cta_click`, `support_page_click`, `calculator_start`, `calculator_complete`, `generator_start`, `generator_complete`, `download_click`, `print_click`, `result_copy`.

4. Distribution loop
   - Pick 5 long-tail pages per week: one per asset plus one winner.
   - Share in relevant communities/resource contexts only when useful.
   - Record placement URL, date, page promoted, and expected query.
   - Re-check Search Console after 7–14 days.

## Decision rules

- Keep: page earns impressions, clicks, or tool CTA events.
- Improve: page gets impressions but weak CTR or no clicks to the tool.
- Distribute: page is technically valid but has zero impressions.
- Consolidate/prune: page has no impressions, no referrals, and no clear intent after 30–45 days.

## Baseline captured on 2026-06-02

Period: 2026-05-05 to 2026-06-01.

Search Console Asset Lab totals:
- `sc-domain:clarvix.net`: 0 clicks, 0 impressions.
- `https://www.clarvix.net/`: 0 clicks, 0 impressions.
- `https://clarvix.net/`: property returned 403, while domain/www properties worked.

GA4 Asset Lab totals:
- Views: 7.
- Sessions: 5.
- Active users: 4.
- Events: 15.

Top GA4 asset rows:
- `/aistackcost/`: 2 views, 2 sessions, 1 active user, 3 events.
- `/mealplansheet/`: 2 views, 1 session, 1 active user, 4 events.
- `/movebudget/`: 2 views, 1 session, 1 active user, 5 events.
- `/mealplansheet/grocery-list-template/`: 1 view, 1 session, 1 active user, 3 events.

GTM status:
- Container: `GTM-KQ8MQBNQ`.
- Visible tags: 1.
- Visible triggers: 0.

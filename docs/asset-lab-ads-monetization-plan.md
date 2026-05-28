# Asset Lab ads monetization setup plan

Goal: prepare Clarvix Asset Lab assets for display ads that can pay once the site is approved, without risking AdSense/publisher rejection by adding live ad scripts too early.

## Current status

- Domain: https://clarvix.net
- Existing tracking: GTM `GTM-KQ8MQBNQ` is already on the main Asset Lab tool pages.
- Live ad scripts: none intentionally installed. Keep it this way until an ad network approves the site.
- Inactive placements prepared in source with `data-ad-status="inactive"` and `data-ad-slot`.
- Privacy policy exists, but it must be updated before live advertising/cookie-based ads.

## Network order

1. Google AdSense: first approval target because minimum traffic is not the main blocker; original content, policy compliance and code access are required.
2. Ezoic or similar low/minimum-traffic publisher stack: consider after basic traffic exists or if AdSense approval/revenue is weak.
3. Mediavine Journey / Mediavine: apply later when sessions are materially higher; generally traffic-quality dependent.
4. Raptive: later premium tier only after strong traffic.
5. Direct sponsorship/affiliate blocks: activate only for clearly relevant pages and after disclosure/privacy wording is ready.

## Before applying to AdSense

- Publish at least 3-5 strong main tools, each with 3-6 useful support pages.
- Keep every page original, useful and not thin.
- Make sure each tool has title, meta description, canonical, schema, internal links and mobile UX.
- Keep no prohibited/copycat/IP-risk content.
- Ensure privacy policy, contact, accessibility and navigation are reachable.
- Do not show internal RPM/RPV language to visitors.

## Technical setup needed after approval

1. Add the AdSense site verification / auto ads script only after the user approves activation.
2. Create `/ads.txt` at site root with the exact publisher line copied from the approved AdSense account.
3. Replace inactive ad-slot placeholders with network-specific units, starting with conservative placements only:
   - top/native unit after hero or first result;
   - contextual unit near guide/support content;
   - no intrusive popups, interstitials or layout-breaking units.
4. Configure consent management for EEA/UK/Switzerland traffic using a Google-certified CMP if personalized Google ads are served there.
5. Update privacy/cookie policy to mention analytics, advertising cookies, ad partners, user choices and consent.
6. Add GTM events for ad slot visibility/click-outs only if allowed by policy and not collecting private data.
7. Monitor revenue by page, not only site-wide: pageviews, RPM, RPV, completion rate and bounce.

## Activation guardrails

- Never commit `adsbygoogle`, `googlesyndication`, Taboola/Outbrain widgets or affiliate tracking without explicit activation approval.
- Never send private calculator inputs to analytics or ad platforms.
- Keep finance pages educational only; no personalized financial claims.
- Keep meal/health pages non-medical and non-diet-advice.
- Use inactive placeholders while waiting for approval.

## Immediate next actions

- Verify all current assets have inactive ad slots and support-page SEO blocks.
- Update privacy/cookie policy before live ad activation.
- Apply to AdSense from the user browser with the user Google account.
- After approval, copy the exact `ads.txt` line and publisher/client ID into the repo and deploy.

# PROJECT-WIDE STANDING RULES — AD NETWORK COMPLIANCE & SEO SAFETY

These apply to all current and future work on this project. The goal is that when we later integrate AdSense, Carbon Ads, or similar networks, they slot into pre-built, safe positions — never bolted on afterward — and never put our Google Search ranking or ad account standing at risk.

## WHY THIS MATTERS (understand this, don't just follow it mechanically)
Google's Core Web Vitals — Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS), and Interaction to Next Paint (INP) — are BOTH a Google Search ranking factor AND a direct AdSense account-health factor. In 2026, Google requires LCP under 2.5s, INP under 200ms, and CLS under 0.1 as part of AdSense approval and continued standing, and the same three metrics affect search ranking independently. This means: a layout-shift bug is not just a UX problem — it can simultaneously hurt our search ranking AND our ad account AND our revenue, all from the same root cause. Treat CLS specifically as a top-priority metric, not a nice-to-have.

## 1. Reserve Ad Space Before Any Ad Script Exists
Every future ad placement must have its container built into the layout NOW, with a fixed min-height matching its intended ad size (e.g., `min-height: 280px` for a standard unit), even while empty or showing a placeholder. This is called an aspect-ratio/dimension-reserved box. An ad script loading into a zero-height container and then "popping" the page open is the single most common cause of CLS violations and is not acceptable. Never let an ad container's size depend on the ad's own load completing.

## 2. All Ad Scripts Load Async, Never Blocking
Any ad script tag (AdSense: `adsbygoogle.js`, Carbon: `carbon.js`, or any other network) must use the `async` attribute and must load after initial page content, never blocking or delaying the 0.5s first-paint budget already established for this project. If a network's own snippet doesn't include async by default, add it — do not paste vendor snippets verbatim without checking this first.

## 3. Never Style an Ad Container to Resemble a UI Control
Ad containers must be visually and structurally distinct from real interactive elements (search bar, buttons, navigation). Do not reuse the same rounded-rect/dark-panel visual style used for the search bar or any clickable control on an ad wrapper. This is a direct Google policy violation category ("formatting content to mimic ads" / accidental-click inducement) and independently a real UX harm.

## 4. Label Ads Plainly, Never Rely on Default Placement Alone
Any ad unit must be preceded by a plain, unambiguous label ("Advertisement" or "Sponsored") — this is already implemented correctly on this project and must not regress. Never remove or soften this label.

## 5. Respect Network-Specific Placement Rules — Do Not Assume One Network's Rules Apply to Another
Different ad networks have different, sometimes conflicting placement requirements. Example: Carbon Ads requires its ad be visible within 3x the mobile viewport height from page top (roughly a single scroll on a typical phone) — this is a Carbon-specific rule, not a general one, and Carbon explicitly reserves the right to inject its own CSS into your container if your implementation doesn't match its approved format. Before implementing a placement for any specific network, check that network's current placement policy directly — do not assume AdSense's rules, or this project's general rules, automatically satisfy a different network's requirements.

## 6. No Auto-Refresh, No Pop-Unders, No Interstitials
Never implement an ad unit that auto-refreshes on a timer, opens in a pop-under, or blocks the page as an interstitial. These are explicit Google policy violations and are also the ad patterns most likely to make users leave, which independently damages engagement metrics that feed back into search ranking.

## 7. Limit Ad Density — Content Must Dominate, Not Ads
Never place more than one ad unit per viewport/screen-height without explicit approval. A page that reads as "mostly ads, some content" risks both policy penalties (thin-content / ad-heavy patterns) and search ranking harm (Google's page-experience signals). The utility (the actual clock feature) must always be the dominant visual element on any screen that also shows an ad.

## 8. Mobile Ad Behavior is a Separate, Explicit Concern — Not an Afterthought
Do not assume a desktop-safe ad placement is automatically mobile-safe. Specifically avoid sticky/anchor ad units that cover tappable UI (like our search bar) or that shift on scroll. Any mobile ad placement must be checked against that network's specific mobile placement rules (see Rule 5) before implementation, not adapted from the desktop version by assumption.

## 9. Treat CLS as a Regression-Testable Metric, Not Just a Visual Check
When verifying any change (per the existing mandatory verification rules), explicitly check for layout shift, not just "does it look right." If Lighthouse or PageSpeed Insights is available in this environment, run it and report the actual CLS/LCP/INP numbers as part of verification. If it's not available, state that plainly (per the existing "say so when uncertain" rule) rather than presenting an unverified visual check as equivalent to a real Core Web Vitals measurement.

## 10. No Ad Integration Without Explicit Approval (ties to existing dependency rule)
Do not add any ad network's actual script/account/tracking code without explicit approval — this project currently has ad CONTAINERS reserved in the layout, but no live ad network integrated. Adding a real script is a dependency-level and policy-level decision, not a styling decision, and follows the same approval process as Rule 2 in the existing project rules (no new dependencies without approval).

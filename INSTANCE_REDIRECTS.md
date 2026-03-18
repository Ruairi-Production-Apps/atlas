# Atlas Instance — Active Temporary Redirects

These routes are temporarily redirected to `/` (home) for Instance mode.
They are Hub-only features that will be re-enabled for Instance once built out.

| Route | Reason | Date Added | Status |
|---|---|---|---|
| `/events` | Events Calendar — not yet filtered to instance-only content | 2026-03-16 | Redirected to `/` |
| `/news` | News — not yet filtered to instance-only content | 2026-03-16 | Redirected to `/` |
| `/knowledgebase` | Knowledgebase — not yet built for Instance mode | 2026-03-16 | Redirected to `/` |
| `/provinces` | Directory — Hub-only feature | Pre-existing | Redirected to `/` |
| `/counties` | Directory — Hub-only feature | Pre-existing | Redirected to `/` |

## Where redirects are implemented

- **Middleware:** `src/proxy.ts` — `restrictedInstancePaths` array (line ~110)
- **Nav hidden:** `src/components/layout/navigation-bar.tsx` — wrapped in `{isHub && (...)}` conditionals

## How to re-enable a route

1. Remove the path from `restrictedInstancePaths` in `src/proxy.ts`
2. Remove the `{isHub && (...)}` wrapper from the nav link in `navigation-bar.tsx` (or change to show for both modes)
3. Update this file

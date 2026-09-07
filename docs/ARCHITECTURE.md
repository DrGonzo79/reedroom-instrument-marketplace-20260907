# Architecture and decisions

## Current system

Next.js App Router + TypeScript → shared `data/instruments.json` → interactive client views.
Optional frontend API configuration → FastAPI catalog and royalty endpoints → the same fixture file.
Browser localStorage → saved instrument IDs only. No authentication, hosted database or cross-device syncing.

`GET /health`: service health and demo mode.
`GET /instruments?q=&family=`: case-insensitive search and family filtering.
`POST /royalties/estimate`: bounded strict integer inputs and integer-cent output. No payment or financial action occurs.

## Decision: separate demo hosting from backend hosting

Pages supports a static Next.js export, not a Python process. Therefore the live Pages experience is explicitly a browser-only demo. GitHub Actions tests both stacks and deploys only `out/`. Every asset uses the configured repository base path. A separate Docker deployment can host Python later, subject to an explicit hosting/budget choice.

## Decision: one source of catalog truth

Python and TypeScript read the same JSON. Demo data stays small and reviewable. Production will need persistent Instrument, Artist, RecordingSession, License, Order, DownloadGrant and RoyaltyLedger entities. A payment ledger, not a UI calculator, must become authoritative for actual royalties.

## Decision: no external media dependencies

Instrument art is original inline SVG. Audio is locally synthesized Web Audio reference tones, labeled as such, not mislabeled sampled instruments. Google Fonts enhances typography; system fallbacks remain usable if blocked. No analytics or tracking is installed.

## Security and failures

Only non-secret public API origin configuration belongs in `NEXT_PUBLIC_*`. API inputs are strict and bounded; unknown fields are rejected. CORS uses an exact allowlist. No browser-submitted royalty amount is suitable for real checkout. A failed configured catalog request visibly falls back to the bundled catalog; failed API calculation displays an error without inventing an API result. Browser storage failures retain an in-memory collection and show a notice.

## Next slice

Move catalog storage into a database only when real submissions exist. Add signed uploads, malware/file validation, moderation and rights approval before accepting public audio. Do not add credentials, customer files, newsletter exports or private source material to git.

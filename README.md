# Reedroom

**Instruments with a story.** A musician-first sample-library marketplace concept, built as an interactive Next.js application with a runnable Python/FastAPI service.

## Try it

- [Live interactive demo](https://drgonzo79.github.io/reedroom-instrument-marketplace-20260907/)
- Filter and search instrument families; inspect proposed library specifications.
- Play short synthesized reference melodies. These are **not recordings of the named instruments**.
- Save a collection in your browser and export its catalog entries as JSON.
- Open Artist studio and calculate an illustrative artist/platform revenue split.

All artists, prices and library specifications are fictional fixtures. No audio files, plugin binaries, purchases or licenses are provided. The name is a working title; trademark clearance has not been performed.

## Run locally

Requires Node.js 22+, Python 3.11+ and uv.

```sh
npm ci
npm run dev
```

The default frontend runs independently using the shared demo catalog. In another terminal:

```sh
cd api
uv sync --frozen
uv run uvicorn main:app --reload --port 8000
```

Open `http://localhost:3000`. Python API documentation: `http://localhost:8000/docs`.
To connect the frontend to Python, restart Next.js with the non-secret configuration `NEXT_PUBLIC_API_URL=http://localhost:8000`. The API accepts `http://localhost:3000` by default; set `ALLOWED_ORIGINS` to a comma-separated list of exact frontend origins for other deployments.

## Verify

```sh
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
cd api
uv run pytest -q
```

`package-lock.json` and `api/uv.lock` lock the installed dependencies. CI runs type checking, Python integration tests, browser tests and a repository-base-path-aware static build before deploying Pages.

## Deployment boundary

GitHub Pages serves the **Next.js static export**, with local browser state and demo calculations. It does not host Python, server-side Next.js routes, a database or authentication. The public demo does not send collection data to a server.

The Python service is runnable, tested source code, **not a deployed public backend**. A root Dockerfile is supplied for an operator-selected container host:

```sh
docker build -t reedroom-api .
docker run --rm -p 8000:8000 reedroom-api
```

The container recipe requires separate runtime validation. Before a public API launch: select hosting and budget, configure HTTPS and exact CORS origins, add rate limiting, and set the frontend API URL at build time. Auth, durable storage, real uploads and payments are intentionally out of scope. No cloud resources are provisioned by this repository.

## Product direction

Start with one distinctive instrument and one consenting musician, not a sprawling marketplace. Sell a small, rights-cleared, genuinely playable sample library to independent producers. Validate willingness to pay before adding automated plugin packaging or AI features. See [product brief](docs/PRODUCT.md), [architecture and decisions](docs/ARCHITECTURE.md), [build prompts](docs/BUILD_PROMPTS.md), and [source notes](research/notes.md).

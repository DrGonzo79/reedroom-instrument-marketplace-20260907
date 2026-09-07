# Product brief and founder review

## Customer and painful status quo

Independent producers and small film/game composers want characterful acoustic sounds without hiring session players for every cue. Existing libraries are abundant; scarcity alone is not differentiation. The hypothesis is that a highly playable, unusually intimate recording with transparent artist provenance can earn a place in a producer's existing workflow.

## Narrow paid wedge

One harmonium library, made with one musician and a signed recording/distribution agreement. Offer a clearly specified WAV/SFZ pack before claiming VST/AU support. A $49 price and 60% artist share are hypotheses, not researched market facts. The prototype shows four fictional examples to exercise catalog filtering, not a promise of four launch products.

## MVP and acceptance

Current: filter/search, instrument detail dialog, synthesized audio preview, browser-local save/remove, collection export, royalty simulation, and a Python API using a shared catalog.

Next real slice: record a single instrument with documented velocities, round robins, noise floor and note coverage; produce a playable pack; test it in two supported samplers; publish a genuine audio demo with explicit usage rights. Checkout and license issuance must be server-authoritative, with idempotent payment webhooks and expiring download links.

## Validation and go-to-market

Interview 10 independent producers, ask them to use a playable free excerpt in an actual track, and seek five paid preorders with clear delivery/refund terms. Reach buyers through musician collaborations, sampler communities and public production walkthroughs—not generic paid acquisition. Do not invent testimonials, sales counts or demand scores.

Track listening-to-save rate, excerpt-to-project use, preorder conversion, refund requests, support minutes per customer and repeat purchases. A saved item in this prototype is not a sale or evidence of demand.

## Economics

At $49 × 100 sales, gross revenue is $4,900. At a 60% split, the artist receives $2,940 and the platform retains $1,960 **before** fees, tax, refunds, recording, editing, hosting and support. Contract terms must establish whether royalties are computed on gross or net proceeds. The sandbox assumes gross. Integer-cent arithmetic floors fractional artist cents and gives the remainder to the platform; production contracts must explicitly define rounding.

## Founder review

- Reject the premise that “rare instrument” automatically means defensible demand. Playability, provenance and producer outcomes matter more than catalog size.
- Do not add AI-generated music merely because the source newsletter mentions AI tools. No AI dependency is necessary for catalog discovery or royalty arithmetic.
- Royalty-bearing recordings need written musician, composition and distribution rights; those agreements are prerequisites, not paperwork to add later.
- A marketplace faces a two-sided cold start. Start as a tiny curated publisher and prove repeat purchases before opening submissions.
- This independent music-product concept does not rely on employer identity, access or endorsement.

## 30 / 60 / 90 days

30: producer interviews, rights agreement, one playable excerpt, five paid-validation decisions.
60: supported pack formats, actual preview recordings, quality checks, license terms, delivery and refund handling.
90: instrument two only if conversion, support and repeat-use results justify it; artist payout reconciliation and catalog search based on real usage.

## Risks and observability

Main risks: rights disputes, unrealistic sample quality, sampler incompatibility, refund burden, fake demand signals and royalty reconciliation errors. Before paid launch add request IDs, error metrics, webhook replay tests, purchase/download audit events and a reconciliation report. Never expose private artist contracts or raw customer metadata in public repos.

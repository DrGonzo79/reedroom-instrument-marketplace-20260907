# Phased implementation prompts

## 1. Prove the first real instrument

Study this repository and PRODUCT.md. Replace one fixture with rights-cleared recordings provided by the operator. Validate note coverage, velocity layers and file integrity; write tests before implementing pack validation. Add genuine preview playback with accessible controls and explicit license status. Do not invent recording rights or redistribute unapproved audio.

## 2. Connect a production catalog

Preserve the current browse/save experience. Propose a deployment and database budget for approval. Add persistent instrument metadata and a private artist submission flow with auth, upload validation and approval states. Test the flow from submission to approved catalog entry. Keep secrets server-side. Deploy only after operator approval; distinguish frontend, API and database verification.

## 3. Deliver a paid library safely

First agree on license, gross/net royalty basis, rounding and refund policy. Add test-mode checkout, idempotent payment webhooks, server-generated download grants and a reconciled royalty ledger. Tests must cover duplicate events, refunds, expired links and unauthorized downloads. Do not enable live payments without explicit approval. Measure successful delivery and refund/support cost before expanding the catalog.

# Drape PK

**One fitting room. Every brand.**

A portfolio demo for multi-brand Pakistani fashion discovery and local AI virtual try-on. It includes 75 cached official-brand listings, responsive editorial browsing, filters, product details, a private photo fitting room, and a CatVTON-powered FastAPI service sized for an 8 GB CUDA GPU.

Catalogue data is periodically scraped from public official-brand Shopify feeds and cached for reliability. Prices and availability can change; purchase links always return to the source brand.

```bash
npm install
npm run dev
```

Refresh public catalogue data with `npm run scrape`. The scraper is rate-limited, removes duplicates, normalizes categories, and keeps the previous cache if fewer than 40 valid products are found.

For local AI setup and service contracts, see [`ai-service/README.md`](ai-service/README.md). CatVTON is used only for this non-commercial demo under CC BY-NC-SA 4.0. Profile measurements provide styling guidance, not guaranteed sizing accuracy.

Production try-on uses the public Hugging Face IDM-VTON ZeroGPU Space. Set a free `HF_TOKEN` in the deployment environment for authenticated daily quota; anonymous testing has a smaller shared allowance. If `FASHN_API_KEY` is also set, FASHN Try-On v1.6 becomes the fallback when free capacity is unavailable. Local development continues to use `AI_SERVICE_URL` (default `http://127.0.0.1:8001`). Never expose these secrets in browser code.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/TODO.md`](docs/TODO.md), and [`docs/DECISIONS.md`](docs/DECISIONS.md).

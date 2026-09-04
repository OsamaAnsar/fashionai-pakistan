# Local try-on service

CatVTON powers the non-commercial portfolio demo at 512×768, FP16, 30 steps and one request at a time. It lazy-loads weights on the first `POST /try-on` request.

```powershell
.\ai-service\setup.ps1
python -m uvicorn app:app --app-dir ai-service --port 8001
```

Submit multipart fields `person`, `garment`, optional `category` (`upper`, `lower`, `overall`) and optional `seed`. Output is a PNG. Generated images are not retained by this service.

`POST /visual-search` accepts `query`, a JSON `catalogue` containing product IDs and image URLs, and optional `top_k`. CLIP catalogue embeddings are persisted in `storage/embeddings`; query images are not stored. The first search downloads the CLIP model and builds the index.

For the local stylist, install Ollama and run `ollama pull llama3.2:3b`. `POST /stylist` accepts a prompt plus catalogue JSON, filters to 12 candidates before inference, and returns three product IDs with a short explanation. Override `OLLAMA_URL` or `OLLAMA_MODEL` if needed.

`POST /looks` accepts the same payload and returns a validated top, bottom and jacket from distinct brands while respecting a stated total budget.

`POST /wardrobe-advice` accepts a prompt, catalogue and wardrobe metadata. It sends Ollama at most 20 owned-item descriptions and 12 market candidates; wardrobe images remain local.

CatVTON code and checkpoints are CC BY-NC-SA 4.0 and restricted here to a non-commercial demo.

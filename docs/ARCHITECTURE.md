# Architecture

Next.js App Router renders a typed client catalogue. Route handlers validate, store, serve and delete one local fitting-room photo.

The separate FastAPI service exposes `POST /try-on` and runs CatVTON locally on CUDA. It lazy-loads FP16 weights, normalizes inputs to 512×768, generates one request at a time, and returns an unretained PNG. This keeps GPU dependencies and non-commercial model licensing isolated from the web app.

`POST /visual-search` uses CLIP ViT-B/32. Catalogue image embeddings are cached on disk under a content signature; only the uploaded query is embedded per search. The Next.js API route validates uploads and keeps the Python service URL server-side.

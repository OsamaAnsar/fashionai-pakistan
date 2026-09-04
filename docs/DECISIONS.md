# Decisions

- Catalogue is deterministic local data so the demo stays reliable.
- Brand names link only to official homepages; listings are clearly marked as illustrative.
- Remote editorial imagery is used for the prototype and must be replaced with licensed product photography before launch.
- No AI or persistence until the catalogue experience is validated.
- CatVTON was selected for the non-commercial VTON demo because its official implementation documents approximately 8 GB VRAM at 1024×768. This integration uses 512×768 FP16 and serial inference for the RTX 3070 Laptop target.
- Visual search uses local CLIP ViT-B/32 on CPU, preserving GPU memory for CatVTON. Catalogue embeddings persist by catalogue signature; query images are never stored.
- The stylist filters to at most 12 products before calling Ollama `llama3.2:3b`; it never sends the full catalogue and provides an explicit deterministic fallback.
- Cross-brand looks enforce one top, one bottom and one jacket from three distinct brands, then validate the LLM output and total budget before display.
- Wardrobe photos stay in local storage; only category, colour and description metadata may be included in the 20-item Ollama context.
- The digital twin is positioned as preference and visual guidance, not sizing prediction; its local profile is included in stylist, look and wardrobe prompts.
- Try-on accepts only server-stored photo names and seeded catalogue IDs; generated previews are returned with `no-store` and remain browser-memory only.
- The verified Windows runtime pins CUDA PyTorch 2.4, Diffusers 0.29.2 and PEFT 0.13.2; the service passes real 512×768 inference on the RTX 3070 Laptop GPU.

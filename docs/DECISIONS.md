# Decisions

- Catalogue is deterministic local data so the demo stays reliable.
- Brand names link only to official homepages; listings are clearly marked as illustrative.
- Remote editorial imagery is used for the prototype and must be replaced with licensed product photography before launch.
- No AI or persistence until the catalogue experience is validated.
- CatVTON was selected for the non-commercial VTON demo because its official implementation documents approximately 8 GB VRAM at 1024×768. This integration uses 512×768 FP16 and serial inference for the RTX 3070 Laptop target.
- Visual search uses local CLIP ViT-B/32 on CPU, preserving GPU memory for CatVTON. Catalogue embeddings persist by catalogue signature; query images are never stored.

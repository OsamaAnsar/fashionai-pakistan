# Local try-on service

CatVTON powers the non-commercial portfolio demo at 512×768, FP16, 30 steps and one request at a time. It lazy-loads weights on the first `POST /try-on` request.

```powershell
.\ai-service\setup.ps1
python -m uvicorn app:app --app-dir ai-service --port 8001
```

Submit multipart fields `person`, `garment`, optional `category` (`upper`, `lower`, `overall`) and optional `seed`. Output is a PNG. Generated images are not retained by this service.

CatVTON code and checkpoints are CC BY-NC-SA 4.0 and restricted here to a non-commercial demo.

if (!(Test-Path "vendor/CatVTON")) { git clone --depth 1 https://github.com/Zheng-Chong/CatVTON.git vendor/CatVTON }
python -m pip install -r vendor/CatVTON/requirements.txt
python -m pip install -r ai-service/requirements.txt
Write-Host "Start with: python -m uvicorn app:app --app-dir ai-service --port 8001"

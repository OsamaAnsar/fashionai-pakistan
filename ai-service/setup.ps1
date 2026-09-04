if (!(Test-Path "vendor/CatVTON")) { git clone --depth 1 https://github.com/Zheng-Chong/CatVTON.git vendor/CatVTON }
python -m pip install torch==2.4.0 torchvision==0.19.0 --index-url https://download.pytorch.org/whl/cu121
$filtered = New-TemporaryFile
Get-Content vendor/CatVTON/requirements.txt | Where-Object { $_ -notmatch '^(torch|torchvision|matplotlib|peft|git\+.*diffusers)' } | Set-Content $filtered
python -m pip install -r $filtered
Remove-Item -LiteralPath $filtered
python -m pip install -r ai-service/requirements.txt
$sitePackages = python -c "import site; print(site.getsitepackages()[0])"
$torchLib = Join-Path $sitePackages "torch\lib"
$openMpAlias = Join-Path $torchLib "libomp140.x86_64.dll"
if (!(Test-Path $openMpAlias)) { Copy-Item -LiteralPath (Join-Path $torchLib "libiomp5md.dll") -Destination $openMpAlias }
python -c "import torch; print('CUDA ready:', torch.cuda.is_available(), torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'not found')"
Write-Host "Start with: python -m uvicorn app:app --app-dir ai-service --port 8001"

import io, os, sys, threading
from pathlib import Path
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from PIL import Image

app=FastAPI(title="Drape PK Try-On",version="0.1.0")
lock=threading.Lock(); backend=None

class CatVTON:
 def __init__(self):
  repo=Path(os.getenv("CATVTON_PATH","vendor/CatVTON")).resolve()
  if not repo.exists(): raise RuntimeError("CatVTON is not installed. Run setup.ps1 first.")
  sys.path.insert(0,str(repo))
  import torch
  from diffusers.image_processor import VaeImageProcessor
  from huggingface_hub import snapshot_download
  from model.cloth_masker import AutoMasker
  from model.pipeline import CatVTONPipeline
  from utils import init_weight_dtype
  checkpoint=snapshot_download(repo_id="zhengchong/CatVTON")
  self.torch=torch;self.masker=AutoMasker(densepose_ckpt=f"{checkpoint}/DensePose",schp_ckpt=f"{checkpoint}/SCHP",device="cuda")
  self.mask_processor=VaeImageProcessor(vae_scale_factor=8,do_normalize=False,do_binarize=True,do_convert_grayscale=True)
  self.pipeline=CatVTONPipeline(base_ckpt="runwayml/stable-diffusion-inpainting",attn_ckpt=checkpoint,attn_ckpt_version="mix",weight_dtype=init_weight_dtype("fp16"),use_tf32=True,device="cuda")
 def run(self,person:Image.Image,garment:Image.Image,category:str,seed:int):
  from utils import resize_and_crop,resize_and_padding
  person=resize_and_crop(person.convert("RGB"),(512,768));garment=resize_and_padding(garment.convert("RGB"),(512,768))
  mask=self.mask_processor.blur(self.masker(person,category)["mask"],blur_factor=9)
  generator=self.torch.Generator(device="cuda").manual_seed(seed)
  return self.pipeline(image=person,condition_image=garment,mask=mask,num_inference_steps=30,guidance_scale=2.5,generator=generator)[0]

def image(file:UploadFile)->Image.Image:
 try:return Image.open(file.file)
 except Exception as exc:raise HTTPException(415,"Invalid image") from exc

@app.get("/health")
def health():return {"ok":True,"model":"CatVTON","loaded":backend is not None,"resolution":"512x768"}

@app.post("/try-on")
def try_on(person:UploadFile=File(...),garment:UploadFile=File(...),category:str=Form("upper"),seed:int=Form(42)):
 global backend
 if category not in {"upper","lower","overall"}:raise HTTPException(400,"category must be upper, lower or overall")
 if not lock.acquire(blocking=False):raise HTTPException(429,"A try-on is already running")
 try:
  if backend is None:backend=CatVTON()
  result=backend.run(image(person),image(garment),category,seed);output=io.BytesIO();result.save(output,"PNG")
  return Response(output.getvalue(),media_type="image/png",headers={"Cache-Control":"no-store"})
 except RuntimeError as exc:raise HTTPException(503,str(exc)) from exc
 finally:lock.release()

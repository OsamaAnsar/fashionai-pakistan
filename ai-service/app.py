import hashlib, io, json, os, sys, threading
from pathlib import Path
from typing import Any
import numpy as np
import requests
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from PIL import Image

app=FastAPI(title="Drape PK Try-On",version="0.1.0")
lock=threading.Lock(); backend=None; search_backend=None

class VisualSearch:
 def __init__(self):
  import torch
  from transformers import CLIPModel, CLIPProcessor
  self.torch=torch;self.device="cpu"
  self.model=CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(self.device).eval()
  self.processor=CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
  self.cache_dir=Path("storage/embeddings");self.cache_dir.mkdir(parents=True,exist_ok=True)
 def embed(self,images:list[Image.Image])->np.ndarray:
  inputs=self.processor(images=images,return_tensors="pt",padding=True).to(self.device)
  with self.torch.inference_mode(): vectors=self.model.get_image_features(**inputs)
  vectors=vectors/vectors.norm(dim=-1,keepdim=True)
  return vectors.cpu().numpy()
 def index(self,products:list[dict[str,Any]])->tuple[list[str],np.ndarray]:
  signature=hashlib.sha256(json.dumps([(p["id"],p["imageUrl"]) for p in products]).encode()).hexdigest()[:16]
  path=self.cache_dir/f"catalogue-{signature}.npz"
  if path.exists():
   cached=np.load(path);return cached["ids"].tolist(),cached["vectors"]
  ids=[];images=[]
  for product in products:
   response=requests.get(product["imageUrl"],timeout=15);response.raise_for_status()
   ids.append(product["id"]);images.append(Image.open(io.BytesIO(response.content)).convert("RGB"))
  vectors=np.concatenate([self.embed(images[i:i+8]) for i in range(0,len(images),8)])
  np.savez_compressed(path,ids=np.array(ids),vectors=vectors)
  return ids,vectors

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
def health():return {"ok":True,"tryOn":"CatVTON","tryOnLoaded":backend is not None,"visualSearch":"CLIP ViT-B/32","searchLoaded":search_backend is not None}

@app.post("/visual-search")
def visual_search(query:UploadFile=File(...),catalogue:str=Form(...),top_k:int=Form(6)):
 global search_backend
 try: products=json.loads(catalogue)
 except json.JSONDecodeError as exc: raise HTTPException(400,"Invalid catalogue") from exc
 if not isinstance(products,list) or not products: raise HTTPException(400,"Catalogue is empty")
 if not lock.acquire(blocking=False):raise HTTPException(429,"The AI service is busy")
 try:
  if search_backend is None:search_backend=VisualSearch()
  ids,vectors=search_backend.index(products);query_vector=search_backend.embed([image(query)])[0]
  scores=vectors@query_vector;ranking=np.argsort(scores)[::-1][:max(1,min(top_k,12))]
  return {"matches":[{"id":ids[index],"score":round(float(scores[index]),4)} for index in ranking]}
 except (RuntimeError,requests.RequestException) as exc:raise HTTPException(503,str(exc)) from exc
 finally:lock.release()

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

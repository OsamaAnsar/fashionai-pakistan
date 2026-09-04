import {NextResponse} from "next/server";
import {readProfile,writeProfile} from "@/lib/profile";
import type {StyleProfile} from "@/lib/profile-types";
const text=(value:unknown,max=40)=>typeof value==="string"?value.trim().slice(0,max):"";
const number=(value:unknown)=>typeof value==="number"&&Number.isFinite(value)&&value>0&&value<300?value:null;
export async function GET(){return NextResponse.json({profile:await readProfile()})}
export async function PUT(request:Request){const body=await request.json(),brands=["Outfitters","Breakout","Engine","Cougar","Charcoal"],profile:StyleProfile={gender:text(body.gender,20),height:number(body.height),chest:number(body.chest),waist:number(body.waist),inseam:number(body.inseam),preferredFit:text(body.preferredFit,20)||"Regular",styles:Array.isArray(body.styles)?body.styles.map((item:unknown)=>text(item,24)).filter(Boolean).slice(0,8):[],colors:Array.isArray(body.colors)?body.colors.map((item:unknown)=>text(item,24)).filter(Boolean).slice(0,8):[],brandSizes:Object.fromEntries(brands.map(brand=>[brand,text(body.brandSizes?.[brand],8)]).filter(([,size])=>size))};await writeProfile(profile);return NextResponse.json({profile})}

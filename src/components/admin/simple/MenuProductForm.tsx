"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { MenuData, MenuProduct } from "@/lib/admin/menu-model";
import type { MediaChoice } from "@/lib/admin/media-choices";
import { formatTryPriceInput } from "@/lib/admin/pricing";
import { saveMenuProduct } from "@/lib/admin/menu-actions";
import MediaPicker from "./MediaPicker";
import styles from "./SimpleAdmin.module.css";
type Option = { id:string; label:string; price:string; is_active:boolean };
export default function MenuProductForm({data,media,product,branchId,categoryId,onClose}:{data:MenuData;media:MediaChoice[];product?:MenuProduct;branchId:string;categoryId?:string;onClose:()=>void}) {
  const router=useRouter(); const [pending,start]=useTransition(); const [message,setMessage]=useState(""); const [step,setStep]=useState(1);
  const links=data.placements.filter(b=>b.menu_item_id===product?.id);
  const variants=data.variants.filter(v=>links.some(b=>b.id===v.menu_item_branch_id));
  const [name,setName]=useState(product?.name??""); const [category,setCategory]=useState(product?.category_id??categoryId??data.categories[0]?.id??"");
  const [description,setDescription]=useState(product?.description??""); const [image,setImage]=useState(product?.image_media_id??"");
  const [status,setStatus]=useState(product?.status??"draft"); const [active,setActive]=useState(product?.is_active??true);
  const [branches,setBranches]=useState(()=>data.branches.map(b=>{
    const link=links.find(l=>l.branch_id===b.id);
    return { id:b.id,selected:!!link||(!product&&b.id===branchId),is_active:link?.is_active??true,price:formatTryPriceInput(link?.price_cents),variants:data.variants.filter(v=>v.menu_item_branch_id===link?.id).map(v=>({id:v.id,label:v.label,price:formatTryPriceInput(v.price_cents),is_active:v.is_active})) };
  }));
  const setBranch=(id:string,patch:Partial<typeof branches[number]>)=>setBranches(prev=>prev.map(b=>b.id===id?{...b,...patch}:b));
  const setOption=(id:string,index:number,patch:Partial<Option>)=>setBranches(prev=>prev.map(b=>b.id===id?{...b,variants:b.variants.map((v,i)=>i===index?{...v,...patch}:v)}:b));
  const selected=branches.filter(b=>b.selected);
  function next() {
    if(step===1 && (!name.trim()||!category)) {setMessage("Ürün adı ve kategori seçin.");return;}
    if(step===2 && !selected.length) {setMessage("En az bir şube seçin.");return;}
    if(step===3 && selected.some(b=>b.variants.some(v=>!v.label.trim()||!v.price.trim()))) {setMessage("Porsiyon adı ve fiyatını doldurun.");return;}
    setMessage("");setStep(step+1);
  }
  return <section className={styles.panel} aria-label={product?"Ürünü düzenle":"Yeni ürün ekle"}>
    <div className={styles.head}><h2>{product ? `${product.name} — Düzenle` : "Yeni ürün ekle"}</h2><button type="button" disabled={pending} onClick={onClose}>Kapat</button></div>
    {!product ? <ol className={styles.steps}>{["Ürün bilgileri","Şube seçimi","Fiyatlar","Görsel / yayınlama"].map((label,i)=><li aria-current={step===i+1?"step":undefined} key={label}>{i+1} / 4 — {label}</li>)}</ol>:null}
    {message ? <p className={`${styles.notice} ${styles.error}`} role="alert">{message}</p>:null}
    <form onSubmit={e=>{
      e.preventDefault();
      const visibilityChanged=status!==product?.status||active!==product?.is_active||links.some(l=>!selected.some(b=>b.id===l.branch_id)||selected.find(b=>b.id===l.branch_id)?.is_active!==l.is_active)||variants.some(v=>!selected.some(b=>b.variants.some(o=>o.id===v.id&&o.is_active===v.is_active)));
      if(visibilityChanged && !window.confirm("Ürünün yayın durumunu veya görünürlüğünü değiştirmek istiyor musunuz?")) return;
      start(async()=>{
        const result=await saveMenuProduct({id:product?.id,updated_at:product?.updated_at,name,category_id:category,description,image_media_id:image,status,is_active:active,confirmed:visibilityChanged?"EVET":"",branches:selected,
          branch_snapshot:links.map(b=>({id:b.id,updated_at:b.updated_at})),variant_snapshot:variants.map(v=>({id:v.id,updated_at:v.updated_at}))});
        if(result.ok) {onClose();router.refresh();} else setMessage(result.message);
      });
    }}>
      <fieldset disabled={pending} style={{border:0,padding:0,minWidth:0}}>
      {product||step===1 ? <div className={styles.grid}><label className={styles.field}>Ürün adı<input required maxLength={180} value={name} onChange={e=>setName(e.target.value)}/></label>
        <label className={styles.field}>Kategori<select required value={category} onChange={e=>setCategory(e.target.value)}>{data.categories.map(c=><option value={c.id} key={c.id}>{c.name}{c.status!=="published"||!c.is_active?" (sitede kapalı)":""}</option>)}</select></label>
        <label className={styles.field}>Açıklama<textarea maxLength={10000} rows={3} value={description} onChange={e=>setDescription(e.target.value)} /></label></div>:null}
      {product||step===2 ? <div><h3>Hangi şubelerde satılıyor?</h3>{data.branches.map(b=><label className={styles.check} key={b.id}><input type="checkbox" checked={branches.find(x=>x.id===b.id)?.selected??false} onChange={e=>setBranch(b.id,{selected:e.target.checked})}/>{b.name}</label>)}<p>Seçimi kaldırmak ürünü o şubede gizler. Fiyatları korunur.</p></div>:null}
      {product||step===3 ? <div><h3>Şubeye göre fiyatlar</h3>{selected.map(b=><section className={styles.panel} key={b.id}><h4>{data.branches.find(x=>x.id===b.id)?.name}</h4>
        <label className={styles.field}>Fiyat (TL)<input inputMode="decimal" value={b.price} onChange={e=>setBranch(b.id,{price:e.target.value})} placeholder="85,50" /></label><p>Boyut / porsiyon kullanıyorsanız temel fiyat boş kalabilir.</p>
        <label className={styles.check}><input type="checkbox" checked={b.is_active} onChange={e=>setBranch(b.id,{is_active:e.target.checked})}/>Bu şubede göster</label>
        {b.variants.map((v,i)=><div className={styles.option} key={v.id||`new-${i}`}><label className={styles.field}>Boyut / porsiyon<input required maxLength={120} value={v.label} onChange={e=>setOption(b.id,i,{label:e.target.value})}/></label><label className={styles.field}>Fiyat (TL)<input required inputMode="decimal" value={v.price} onChange={e=>setOption(b.id,i,{price:e.target.value})}/></label><label className={styles.check}><input type="checkbox" checked={v.is_active} onChange={e=>setOption(b.id,i,{is_active:e.target.checked})}/>Göster</label></div>)}
        <button type="button" onClick={()=>setBranch(b.id,{variants:[...b.variants,{id:"",label:"",price:"",is_active:true}]})}>+ Seçenek ekle</button></section>)}</div>:null}
      {product||step===4 ? <div><h3>Görsel / yayınlama</h3><MediaPicker choices={media} value={image} onChange={setImage}/><label className={styles.field}>Yayın durumu<select value={status} onChange={e=>setStatus(e.target.value as typeof status)}><option value="draft">Taslak</option><option value="published">Yayında</option><option value="archived">Arşivlenmiş</option></select></label><label className={styles.check}><input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)}/>Sitede göster</label><p>Ürün, şube ve kategori yayında olduğunda ziyaretçi menüsünde görünür.</p></div>:null}
      <div className={styles.actions}>{!product&&step>1?<button type="button" onClick={()=>setStep(step-1)}>Geri</button>:null}{!product&&step<4?<button type="button" className={styles.primary} onClick={next}>Devam</button>:<button className={styles.primary} type="submit">{pending?"Kaydediliyor…":"Ürünü kaydet"}</button>}</div>
      </fieldset>
    </form>
  </section>;
}

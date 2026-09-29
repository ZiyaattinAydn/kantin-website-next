"use client";
import Link from "next/link";
import { useState,useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveContentRecord } from "@/lib/admin/content-actions";
import type { ContentRecord } from "@/lib/admin/content-model";
import type { MediaChoice } from "@/lib/admin/media-choices";
import styles from "./SimpleAdmin.module.css";
export default function ContentEditor({record,media}:{record:ContentRecord;media:MediaChoice[]}) {
  const router=useRouter();const [pending,start]=useTransition();const [message,setMessage]=useState("");
  const [values,setValues]=useState(()=>record.fields.map(f=>f.value));
  function update(i:number,value:string|number|boolean){setValues(v=>v.map((item,j)=>j===i?value:item));}
  return <details className={styles.panel}><summary>{record.label}</summary><form onSubmit={e=>{
    e.preventDefault();if(record.label==="Bölüm görünürlükleri"&&!window.confirm("Site bölümlerinin görünürlüğü değişsin mi?"))return;
    start(async()=>{const result=await saveContentRecord({id:record.id,table:record.table,updated_at:record.updated_at,confirmed:record.label==="Bölüm görünürlükleri"?"EVET":"",changes:record.fields.map((f,i)=>({path:f.path,value:values[i]}))});setMessage(result.message);if(result.ok)router.refresh();});
  }}><fieldset disabled={pending} style={{border:0,padding:0,minWidth:0}}><div className={styles.grid}>{record.fields.map((f,i)=><label className={f.kind==="checkbox"?styles.check:styles.field} key={JSON.stringify(f.path)}>
    {f.kind==="checkbox"?<><input type="checkbox" checked={!!values[i]} onChange={e=>update(i,e.target.checked)}/><span>{f.label}</span></>:<><span>{f.label}</span>{f.kind==="textarea"?<textarea rows={3} maxLength={10000} value={String(values[i])} onChange={e=>update(i,e.target.value)}/>:f.kind==="image"?<select value={String(values[i])} onChange={e=>update(i,e.target.value)}><option value={String(f.value)}>Mevcut görsel</option>{media.map(m=><option value={`media:${m.id}`} key={m.id}>{m.label}</option>)}</select>:<input type={f.kind==="number"?"number":"text"} min={0} max={100} maxLength={10000} value={String(values[i])} onChange={e=>update(i,f.kind==="number"?Number(e.target.value):e.target.value)}/>}</>}
  </label>)}</div><div className={styles.actions}><button className={styles.primary} type="submit">{pending?"Kaydediliyor…":"Değişiklikleri kaydet"}</button><Link className={styles.button} href={record.revisionHref}>Değişiklik geçmişi / geri al</Link></div></fieldset>{message?<p className={styles.notice} role="status">{message}</p>:null}</form></details>;
}

import { Loader2, CheckCircle2, AlertCircle, Clock3 } from "lucide-react";

export function Card({ children, className = "", ...props }) {
  return <div {...props} className={`card ${className}`}>{children}</div>;
}

export function Button({ children, loading=false, variant="primary", className="", ...props }) {
  const styles = {
    primary: "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-violet-200 hover:-translate-y-0.5 hover:shadow-lg",
    mint: "bg-emerald-500 text-white shadow-emerald-100 hover:-translate-y-0.5 hover:shadow-lg",
    soft: "bg-violet-50 text-violet-700 hover:bg-violet-100",
    peach: "bg-amber-50 text-amber-700 hover:bg-amber-100",
    ghost: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  };
  return <button {...props} disabled={loading || props.disabled} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}>{loading && <Loader2 size={16} className="animate-spin" />}{children}</button>;
}

export function Input({ label, error, ...props }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span><input {...props} className={`field ${error ? "border-rose-300 ring-2 ring-rose-50" : ""}`} />{error && <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span>}</label>;
}
export function Textarea({ label, ...props }) { return <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span><textarea {...props} className="field min-h-28 resize-y" /></label>; }
export function Select({ label, children, ...props }) { return <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span><select {...props} className="field">{children}</select></label>; }
export function Stat({ label, value, icon: Icon, tone="violet", hint }) { const tones={violet:"bg-violet-50 text-violet-600",mint:"bg-emerald-50 text-emerald-600",peach:"bg-amber-50 text-amber-600",sky:"bg-sky-50 text-sky-600"}; return <Card><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-3xl font-black tracking-tight">{value}</p>{hint&&<p className="mt-1 text-xs text-slate-400">{hint}</p>}</div><div className={`rounded-2xl p-3 ${tones[tone]}`}><Icon size={21}/></div></div></Card>; }
export function Badge({ children, tone="neutral" }) { const c={neutral:"bg-slate-100 text-slate-600",violet:"bg-violet-50 text-violet-700",mint:"bg-emerald-50 text-emerald-700",peach:"bg-amber-50 text-amber-700",rose:"bg-rose-50 text-rose-700",sky:"bg-sky-50 text-sky-700"}; return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${c[tone]}`}>{children}</span>; }
export function Progress({ value, label=true }) { const p=Math.max(0,Math.min(100,Number(value)||0)); return <div>{label&&<div className="mb-1.5 flex justify-between text-xs font-bold text-slate-500"><span>Progress</span><span>{p}%</span></div>}<div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-700" style={{width:`${p}%`}}/></div></div>; }
export function Notice({ type="info", children }) { const styles={info:"bg-violet-50 text-violet-700 border-violet-100",success:"bg-emerald-50 text-emerald-700 border-emerald-100",error:"bg-rose-50 text-rose-700 border-rose-100",warning:"bg-amber-50 text-amber-800 border-amber-100"}; const I={success:CheckCircle2,error:AlertCircle,warning:Clock3,info:AlertCircle}[type]; return <div className={`flex items-start gap-2 rounded-xl border p-3 text-sm font-semibold ${styles[type]}`}><I size={17} className="mt-0.5 shrink-0"/>{children}</div>; }
export function PageLoader(){return <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="animate-spin text-violet-600" size={30}/></div>;}

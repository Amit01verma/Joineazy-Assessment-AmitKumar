import { LogOut, GraduationCap, LayoutDashboard, Users, ClipboardList, BookOpen, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { user, logout }=useAuth(); const loc=useLocation(); const [open,setOpen]=useState(false);
  const links=user.role==="admin" ? [["/admin","Dashboard",LayoutDashboard],["/admin/assignments","Assignments",ClipboardList],["/admin/groups","Groups",Users]] : [["/dashboard","Dashboard",LayoutDashboard],["/courses","Courses",BookOpen],["/group","My Group",Users],["/assignments","Assignments",ClipboardList]];
  return <div className="min-h-screen bg-[#f7f5ff]">
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/80 backdrop-blur-xl shadow-sm shadow-violet-100/30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to={user.role==="admin"?"/admin":"/dashboard"} className="flex items-center gap-2.5"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-200"><GraduationCap size={22}/></span><span className="text-xl font-black tracking-tight text-slate-900">Joine<span className="text-violet-600">azy</span></span></Link>
        <nav className="hidden items-center gap-1 md:flex">{links.map(([p,n,I])=><Link key={p} to={p} className={`navlink ${loc.pathname===p||loc.pathname.startsWith(p+"/")?"navlink-active":""}`}><I size={16}/>{n}</Link>)}</nav>
        <div className="flex items-center gap-2"><div className="hidden rounded-2xl bg-slate-50 px-3 py-1.5 text-right sm:block"><div className="text-sm font-bold text-slate-800">{user.name}</div><div className="text-[10px] font-black uppercase tracking-widest text-violet-500">{user.role}</div></div><button onClick={logout} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50"><LogOut size={17}/></button><button className="rounded-xl border border-slate-200 bg-white p-2.5 md:hidden" onClick={()=>setOpen(!open)}>{open?<X size={18}/>:<Menu size={18}/>}</button></div>
      </div>
      {open&&<div className="border-t bg-white px-4 py-3 md:hidden">{links.map(([p,n,I])=><Link onClick={()=>setOpen(false)} key={p} to={p} className={`mb-1 flex items-center gap-2 rounded-xl px-3 py-2.5 font-semibold ${loc.pathname===p?"bg-violet-50 text-violet-700":"text-slate-600"}`}><I size={17}/>{n}</Link>)}</div>}
    </header>
    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:py-9">{children}</main>
  </div>;
}

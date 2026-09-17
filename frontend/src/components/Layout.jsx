import {
  LogOut,
  GraduationCap,
  LayoutDashboard,
  Users,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const links =
    user.role === "admin"
      ? [
          ["/admin", "Dashboard", LayoutDashboard],
          ["/admin/assignments", "Assignments", ClipboardList],
          ["/admin/groups", "Groups", Users],
        ]
      : [
          ["/dashboard", "Dashboard", LayoutDashboard],
          ["/group", "My Group", Users],
          ["/assignments", "Assignments", ClipboardList],
        ];
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link
            to={user.role === "admin" ? "/admin" : "/dashboard"}
            className="flex items-center gap-2 text-xl font-black text-indigo-600"
          >
            <GraduationCap /> Joineazy
          </Link>
          <nav className="hidden gap-2 md:flex">
            {links.map(([p, n, I]) => (
              <Link
                key={p}
                to={p}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${loc.pathname === p ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <I size={17} />
                {n}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-bold">{user.name}</div>
              <div className="text-xs uppercase text-slate-400">
                {user.role}
              </div>
            </div>
            <button
              onClick={logout}
              className="rounded-xl border p-2 text-slate-600 hover:bg-slate-50"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-7">{children}</main>
    </div>
  );
}

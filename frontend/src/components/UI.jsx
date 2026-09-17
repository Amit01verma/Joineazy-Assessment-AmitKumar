export const Card = ({ children, className = "" }) => (
  <div
    className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
  >
    {children}
  </div>
);
export const Button = ({ children, className = "", ...p }) => (
  <button
  {...p}
  className={`rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
>
  {children}
</button>
);
export const Input = ({ label, ...p }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-semibold text-slate-700">
      {label}
    </span>
    <input
      {...p}
      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
    />
  </label>
);
export const Textarea = ({ label, ...p }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-semibold text-slate-700">
      {label}
    </span>
    <textarea
      {...p}
      className="min-h-28 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
    />
  </label>
);
export const Stat = ({ label, value, icon: Icon }) => (
  <Card>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-black">{value}</p>
      </div>
      <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
        <Icon />
      </div>
    </div>
  </Card>
);

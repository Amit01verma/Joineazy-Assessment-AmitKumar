import { useEffect, useState } from "react";
import {
  BarChart3,
  ClipboardList,
  Users,
  Plus,
  Edit3,
  CheckCircle2,
} from "lucide-react";
import Layout from "../components/Layout";
import { Card, Button, Input, Textarea, Stat } from "../components/UI";
import { api } from "../services/api";
export function AdminDashboard() {
  const [d, setD] = useState(null);
  useEffect(() => {
    api("/admin/analytics").then(setD);
  }, []);
  return (
    <Layout>
      <div className="mb-7">
        <p className="font-bold text-indigo-600">Professor workspace</p>
        <h1 className="mt-1 text-3xl font-black">Admin dashboard</h1>
        <p className="mt-1 text-slate-500">
          Monitor assignment delivery and confirmation progress.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Stat
          label="Assignments"
          value={d?.assignments ?? "—"}
          icon={ClipboardList}
        />
        <Stat label="Groups" value={d?.groups ?? "—"} icon={Users} />
        <Stat
          label="Confirmed / total"
          value={d ? `${d.confirmed}/${d.total}` : "—"}
          icon={CheckCircle2}
        />
      </div>
      <Card className="mt-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="text-indigo-600" />
          <h2 className="text-xl font-black">Assignment analytics</h2>
        </div>
        <div className="mt-5 space-y-5">
          {d?.byAssignment.map((x) => {
            const p = x.total ? Math.round((x.confirmed / x.total) * 100) : 0;
            return (
              <div key={x.id}>
                <div className="flex justify-between text-sm font-semibold">
                  <span>{x.title}</span>
                  <span>
                    {x.confirmed}/{x.total} · {p}%
                  </span>
                </div>
                <div className="mt-2 h-3 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-600"
                    style={{ width: `${p}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </Layout>
  );
}
const blank = {
  title: "",
  description: "",
  dueDate: "",
  oneDriveLink: "",
  targetAll: true,
  groupIds: [],
};
export function AdminAssignments() {
  const [list, setList] = useState([]),
    [groups, setGroups] = useState([]),
    [f, setF] = useState(blank),
    [editing, setEditing] = useState(null),
    [msg, setMsg] = useState("");
  const load = () =>
    Promise.all([api("/assignments"), api("/groups")]).then(([a, g]) => {
      setList(a);
      setGroups(g);
    });
  useEffect(() => {
    load();
  }, []);
  const save = async (e) => {
    e.preventDefault();
    try {
      const body = { ...f, groupIds: f.groupIds.map(Number) };
      if (editing)
        await api(`/assignments/${editing}`, { method: "PUT", body });
      else await api("/assignments", { method: "POST", body });
      setF(blank);
      setEditing(null);
      setMsg("Assignment saved");
      load();
    } catch (x) {
      setMsg(x.message);
    }
  };
  const edit = (a) => {
    setEditing(a.id);
    setF({
      title: a.title,
      description: a.description,
      dueDate: a.due_date.slice(0, 16),
      oneDriveLink: a.onedrive_link,
      targetAll: a.target_all,
      groupIds: [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <Layout>
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <h1 className="text-3xl font-black">Assignments</h1>
          <p className="mt-1 text-slate-500">
            Create, edit and target assignments.
          </p>
        </div>
        <a href="#form" className="self-start">
          <Button>
            <Plus className="mr-2 inline" size={17} />
            New assignment
          </Button>
        </a>
      </div>
      <Card id="form" className="mt-6">
        <h2 className="text-xl font-black">
          {editing ? "Edit assignment" : "Create assignment"}
        </h2>
        {msg && (
          <p className="mt-3 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-700">
            {msg}
          </p>
        )}
        <form onSubmit={save} className="mt-4 grid gap-4 md:grid-cols-2">
          <Input
            label="Title"
            required
            value={f.title}
            onChange={(e) => setF({ ...f, title: e.target.value })}
          />
          <Input
            label="Due date"
            type="datetime-local"
            required
            value={f.dueDate}
            onChange={(e) => setF({ ...f, dueDate: e.target.value })}
          />
          <div className="md:col-span-2">
            <Textarea
              label="Description"
              value={f.description}
              onChange={(e) => setF({ ...f, description: e.target.value })}
            />
          </div>
          <Input
            label="OneDrive link"
            type="url"
            required
            value={f.oneDriveLink}
            onChange={(e) => setF({ ...f, oneDriveLink: e.target.value })}
          />
          <div>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">
              Assignment scope
            </span>
            <label className="flex items-center gap-2 rounded-xl border p-3">
              <input
                type="checkbox"
                checked={f.targetAll}
                onChange={(e) => setF({ ...f, targetAll: e.target.checked })}
              />{" "}
              Assign to all students/groups
            </label>
          </div>
          {!f.targetAll && (
            <div className="md:col-span-2">
              <span className="mb-2 block text-sm font-semibold">
                Select groups
              </span>
              <div className="grid gap-2 sm:grid-cols-2">
                {groups.map((g) => (
                  <label
                    key={g.id}
                    className="flex gap-2 rounded-xl border p-3"
                  >
                    <input
                      type="checkbox"
                      checked={f.groupIds.includes(g.id)}
                      onChange={(e) =>
                        setF({
                          ...f,
                          groupIds: e.target.checked
                            ? [...f.groupIds, g.id]
                            : f.groupIds.filter((x) => x !== g.id),
                        })
                      }
                    />
                    {g.name} ({g.member_count})
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="md:col-span-2 flex gap-2">
            <Button>
              {editing ? "Update assignment" : "Create assignment"}
            </Button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setF(blank);
                }}
                className="rounded-xl border px-4 py-2.5 text-sm font-bold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </Card>
      <div className="mt-6 space-y-3">
        {list.map((a) => (
          <Card
            key={a.id}
            className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
          >
            <div>
              <h3 className="font-black">{a.title}</h3>
              <p className="text-sm text-slate-500">
                Due {new Date(a.due_date).toLocaleString()} ·{" "}
                {a.target_all ? "All students" : "Selected groups"}
              </p>
            </div>
            <button
              onClick={() => edit(a)}
              className="self-start rounded-xl border px-3 py-2 text-sm font-bold"
            >
              <Edit3 size={15} className="mr-1 inline" />
              Edit
            </button>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
export function AdminGroups() {
  const [gs, setGs] = useState([]),
    [subs, setSubs] = useState([]);
  useEffect(() => {
    Promise.all([api("/groups"), api("/admin/submissions")]).then(([g, s]) => {
      setGs(g);
      setSubs(s);
    });
  }, []);
  return (
    <Layout>
      <h1 className="text-3xl font-black">Groups & submissions</h1>
      <p className="mt-1 text-slate-500">
        Review group membership and student confirmation status.
      </p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {gs.map((g) => (
          <Card key={g.id}>
            <h2 className="text-xl font-black">{g.name}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {g.member_count} member(s)
            </p>
            <div className="mt-4 space-y-2">
              {(g.members || []).filter(Boolean).map((m) => (
                <div key={m.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                  <b>{m.name}</b>
                  <div className="text-slate-500">{m.email}</div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <Card className="mt-6 overflow-x-auto">
        <h2 className="text-xl font-black">Submission confirmations</h2>
        <table className="mt-4 w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="p-3">Assignment</th>
              <th>Group</th>
              <th>Student</th>
              <th>Status</th>
              <th>Confirmed at</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s, i) => (
              <tr className="border-b" key={i}>
                <td className="p-3 font-semibold">{s.title}</td>
                <td>{s.group_name}</td>
                <td>
                  {s.student_name}
                  <div className="text-xs text-slate-400">{s.email}</div>
                </td>
                <td>
                  {s.confirmed ? (
                    <span className="font-bold text-emerald-600">
                      Confirmed
                    </span>
                  ) : (
                    <span className="text-amber-600">Pending</span>
                  )}
                </td>
                <td>
                  {s.confirmed_at
                    ? new Date(s.confirmed_at).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!subs.length && (
          <p className="py-4 text-slate-500">No confirmations yet.</p>
        )}
      </Card>
    </Layout>
  );
}

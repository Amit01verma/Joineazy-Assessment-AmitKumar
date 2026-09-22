import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ClipboardList,
  Users,
  CheckCircle2,
  ExternalLink,
  Plus,
  UserPlus,
  Crown,
  ArrowRight,
  CalendarDays,
} from "lucide-react";
import Layout from "../components/Layout";
import {
  Card,
  Button,
  Input,
  Badge,
  Progress,
  Notice,
  PageLoader,
} from "../components/UI";
import { api } from "../services/api";

const fmt = (d) =>
  new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
const dueTone = (d) => (new Date(d) < new Date() ? "rose" : "peach");

export function StudentDashboard() {
  const [courses, setCourses] = useState([]),
    [assignments, setAssignments] = useState([]),
    [group, setGroup] = useState(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([api("/courses"), api("/assignments"), api("/groups/mine")])
      .then(([c, a, g]) => {
        setCourses(c);
        setAssignments(a.filter((x) => x.assigned));
        setGroup(g);
      })
      .finally(() => setLoading(false));
  }, []);
  if (loading)
    return (
      <Layout>
        <PageLoader />
      </Layout>
    );
  const confirmed = assignments.filter((a) => a.student_confirmed).length;
  return (
    <Layout>
      <div className="fade-up">
        <div className="mb-7 rounded-[1.6rem] bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 p-6 text-white shadow-xl shadow-violet-200 sm:p-8">
          <p className="text-sm font-bold text-violet-100">Student workspace</p>
          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Good to see you 👋
              </h1>
              <p className="mt-2 max-w-xl text-violet-100">
                Stay on top of your courses, assignments and submission
                progress.
              </p>
            </div>
            <Link
              to="/courses"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-bold backdrop-blur hover:bg-white/25"
            >
              Explore courses <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <StatBox
            icon={BookOpen}
            label="Enrolled courses"
            value={courses.length}
            tone="violet"
          />
          <StatBox
            icon={ClipboardList}
            label="Assigned work"
            value={assignments.length}
            tone="peach"
          />
          <StatBox
            icon={CheckCircle2}
            label="Confirmed"
            value={`${confirmed}/${assignments.length || 0}`}
            tone="mint"
          />
        </div>
        <section className="mt-7">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-black">Your courses</h2>
              <p className="text-sm text-slate-500">
                Choose a course to view its assignments.
              </p>
            </div>
            <Link to="/courses" className="text-sm font-bold text-violet-600">
              View all
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 3).map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
            {!courses.length && (
              <Card>
                <p className="text-slate-500">No courses enrolled yet.</p>
              </Card>
            )}
          </div>
        </section>
        <section className="mt-7">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-black">Upcoming assignments</h2>
              <p className="text-sm text-slate-500">
                Your next pieces of work.
              </p>
            </div>
            <Link
              to="/assignments"
              className="text-sm font-bold text-violet-600"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {assignments.slice(0, 4).map((a) => (
              <AssignmentRow key={a.id} a={a} group={group} />
            ))}
            {!assignments.length && (
              <Card>
                <p className="text-slate-500">No assignments assigned yet.</p>
              </Card>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
function StatBox({ icon: Icon, label, value, tone }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-black">{value}</p>
        </div>
        <div
          className={`rounded-2xl p-3 ${tone === "mint" ? "bg-emerald-50 text-emerald-600" : tone === "peach" ? "bg-amber-50 text-amber-600" : "bg-violet-50 text-violet-600"}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </Card>
  );
}
function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course.id}`} className="card group block">
      <div className="flex items-start justify-between">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-50 text-violet-600">
          <BookOpen size={21} />
        </div>
        <Badge tone="violet">{course.code}</Badge>
      </div>
      <h3 className="mt-5 text-lg font-black group-hover:text-violet-700">
        {course.name}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
        {course.description || "Course workspace"}
      </p>
      <div className="mt-5 flex items-center justify-between text-sm font-bold text-violet-600">
        <span>{course.assignment_count || 0} assignments</span>
        <ArrowRight
          size={17}
          className="transition group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}
function AssignmentRow({ a }) {
  const p =
    a.submission_type === "individual"
      ? a.student_confirmed
        ? 100
        : 0
      : a.confirmed_count && a.total_students
        ? Math.round((a.confirmed_count / a.total_students) * 100)
        : 0;
  return (
    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-black">{a.title}</p>
          <Badge tone={a.submission_type === "group" ? "violet" : "sky"}>
            {a.submission_type}
          </Badge>
          <Badge tone={a.student_confirmed ? "mint" : dueTone(a.due_date)}>
            {a.student_confirmed ? "Confirmed" : "Pending"}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {a.course_name} · Due {fmt(a.due_date)}
        </p>
        <div className="mt-3 max-w-md">
          <Progress value={p} />
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <a
          href={a.onedrive_link}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          OneDrive <ExternalLink size={13} className="ml-1 inline" />
        </a>
        <Link
          to={`/assignments/${a.id}`}
          className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white"
        >
          Open
        </Link>
      </div>
    </Card>
  );
}

export function CoursesPage() {
  const [courses, setCourses] = useState([]),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    api("/courses")
      .then(setCourses)
      .finally(() => setLoading(false));
  }, []);
  return (
    <Layout>
      <div className="fade-up">
        <h1 className="text-3xl font-black">My courses</h1>
        <p className="mt-1 text-slate-500">
          Each course has its own assignment workspace.
        </p>
        {loading ? (
          <PageLoader />
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
            {!courses.length && (
              <Card>
                <p className="text-slate-500">No courses enrolled yet.</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export function CoursePage({ id }) {
  const [data, setData] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    api(`/courses/${id}/assignments`)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [id]);
  if (error)
    return (
      <Layout>
        <Notice type="error">{error}</Notice>
      </Layout>
    );
  if (!data)
    return (
      <Layout>
        <PageLoader />
      </Layout>
    );
  return (
    <Layout>
      <div className="fade-up">
        <Link to="/courses" className="text-sm font-bold text-violet-600">
          ← All courses
        </Link>
        <div className="mt-4 rounded-[1.5rem] bg-gradient-to-br from-emerald-50 to-violet-50 p-6">
          <Badge tone="violet">{data.course.code}</Badge>
          <h1 className="mt-3 text-3xl font-black">{data.course.name}</h1>
          <p className="mt-2 text-slate-500">Assignments for this course.</p>
        </div>
        <div className="mt-6 space-y-3">
          {data.assignments.map((a) => (
            <Link
              key={a.id}
              to={`/assignments/${a.id}`}
              className="card block hover:-translate-y-0.5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <h2 className="font-black">{a.title}</h2>
                    <Badge
                      tone={a.submission_type === "group" ? "violet" : "sky"}
                    >
                      {a.submission_type}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Due {fmt(a.due_date)}
                  </p>
                </div>
                <span className="text-sm font-bold text-violet-600">
                  Open assignment →
                </span>
              </div>
            </Link>
          ))}
          {!data.assignments.length && (
            <Card>
              <p className="text-slate-500">
                No assignments in this course yet.
              </p>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}

export function GroupPage() {
  const [group, setGroup] = useState(null),
    [name, setName] = useState(""),
    [identifier, setIdentifier] = useState(""),
    [message, setMessage] = useState(""),
    [loading, setLoading] = useState(false);
  const load = () =>
    api("/groups/mine")
      .then(setGroup)
      .catch((e) => setMessage(e.message));
  useEffect(() => {
    load();
  }, []);
  const create = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/groups", { method: "POST", body: { name } });
      setName("");
      setMessage("Group created successfully.");
      await load();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  };
  const add = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = /^\d+$/.test(identifier.trim())
        ? { studentId: Number(identifier) }
        : { email: identifier };
      await api("/groups/members", { method: "POST", body });
      setIdentifier("");
      setMessage("Member added successfully.");
      await load();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Layout>
      <div className="fade-up">
        <h1 className="text-3xl font-black">My group</h1>
        <p className="mt-1 text-slate-500">
          Collaborate with classmates and keep your team submission-ready.
        </p>
        {message && (
          <div className="mt-4">
            <Notice
              type={
                message.toLowerCase().includes("success") ? "success" : "info"
              }
            >
              {message}
            </Notice>
          </div>
        )}
        {!group ? (
          <Card className="mt-6 max-w-xl">
            <h2 className="text-xl font-black">Create your group</h2>
            <form onSubmit={create} className="mt-5 space-y-4">
              <Input
                label="Group name"
                placeholder="Team Aurora"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Button loading={loading}>
                <Plus size={16} />
                Create group
              </Button>
            </form>
          </Card>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
            <Card>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-600">
                  <Users />
                </div>
                <div>
                  <h2 className="text-xl font-black">{group.name}</h2>
                  <p className="text-sm text-slate-500">
                    {group.members.length} members · Leader:{" "}
                    {group.members.find((m) => m.isLeader)?.name || "—"}
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-2">
                {group.members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                  >
                    <div>
                      <p className="font-semibold">{m.name}</p>
                      <p className="text-sm text-slate-500">{m.email}</p>
                    </div>
                    {m.isLeader && (
                      <Badge tone="peach">
                        <Crown size={12} /> Leader
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <h2 className="text-xl font-black">Add member</h2>
              <p className="mt-1 text-sm text-slate-500">
                Only the group leader can add students.
              </p>
              <form onSubmit={add} className="mt-5 space-y-4">
                <Input
                  label="Student email or ID"
                  placeholder="student@example.com or 12"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
                <Button loading={loading} variant="mint">
                  <UserPlus size={16} />
                  Add member
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}

export function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    api("/assignments")
      .then((a) => setAssignments(a.filter((x) => x.assigned)))
      .finally(() => setLoading(false));
  }, []);
  return (
    <Layout>
      <div className="fade-up">
        <h1 className="text-3xl font-black">Assignments</h1>
        <p className="mt-1 text-slate-500">
          Everything assigned to your enrolled courses.
        </p>
        {loading ? (
          <PageLoader />
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {assignments.map((a) => (
              <Card key={a.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <h2 className="text-xl font-black">{a.title}</h2>
                      <Badge
                        tone={a.submission_type === "group" ? "violet" : "sky"}
                      >
                        {a.submission_type}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {a.course_name} · Due {fmt(a.due_date)}
                    </p>
                  </div>
                  <Badge
                    tone={a.student_confirmed ? "mint" : dueTone(a.due_date)}
                  >
                    {a.student_confirmed ? "Confirmed" : "Pending"}
                  </Badge>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {a.description || "No additional description."}
                </p>
                <div className="mt-5">
                  <Progress
                    value={
                      a.submission_type === "individual"
                        ? a.student_confirmed
                          ? 100
                          : 0
                        : a.total_students
                          ? Math.round(
                              (a.confirmed_count / a.total_students) * 100,
                            )
                          : 0
                    }
                  />
                </div>
                <div className="mt-5 flex gap-2">
                  <a
                    href={a.onedrive_link}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border px-3 py-2 text-sm font-bold"
                  >
                    Open OneDrive
                  </a>
                  <Link
                    to={`/assignments/${a.id}`}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
                  >
                    View assignment
                  </Link>
                </div>
              </Card>
            ))}
            {!assignments.length && (
              <Card className="md:col-span-2">
                <p className="text-slate-500">
                  No assignments are currently assigned to your courses.
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export function AssignmentDetails({ id }) {
  const [assignment, setAssignment] = useState(null),
    [progress, setProgress] = useState(null),
    [step, setStep] = useState(false),
    [message, setMessage] = useState(""),
    [loading, setLoading] = useState(true);
  const load = () =>
    Promise.all([api("/assignments"), api("/assignments/progress")])
      .then(([a, p]) => {
        setAssignment(a.find((x) => String(x.id) === String(id)));
        setProgress(p.find((x) => String(x.id) === String(id)));
      })
      .catch((e) => setMessage(e.message))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, [id]);
  if (loading)
    return (
      <Layout>
        <PageLoader />
      </Layout>
    );
  if (!assignment)
    return (
      <Layout>
        <Notice type="error">Assignment not found.</Notice>
      </Layout>
    );
  const isGroup = assignment.submission_type === "group";
  const isLeader = assignment.is_group_leader;
  const confirmed = assignment.student_confirmed;
  const pct = isGroup
    ? progress?.total_members
      ? Math.round((progress.confirmed_members / progress.total_members) * 100)
      : 0
    : confirmed
      ? 100
      : 0;
  const confirm = async () => {
    setLoading(true);
    try {
      await api(`/submissions/${id}/confirm`, { method: "POST" });
      setMessage(
        isGroup
          ? "Group submission acknowledged for all members."
          : "Submission confirmed successfully.",
      );
      setStep(false);
      await load();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Layout>
      <div className="fade-up">
        <Link to="/assignments" className="text-sm font-bold text-violet-600">
          ← Back to assignments
        </Link>
        <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_340px]">
          <Card>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="violet">{assignment.course_name}</Badge>
              <Badge tone={isGroup ? "violet" : "sky"}>
                {isGroup ? "Group submission" : "Individual submission"}
              </Badge>
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight">
              {assignment.title}
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <CalendarDays size={15} />
              Due {fmt(assignment.due_date)}
            </p>
            <p className="mt-7 whitespace-pre-wrap leading-7 text-slate-600">
              {assignment.description || "No additional instructions provided."}
            </p>
            <a
              href={assignment.onedrive_link}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2.5 font-bold text-violet-700 hover:bg-violet-100"
            >
              Open OneDrive folder <ExternalLink size={15} />
            </a>
            {message && (
              <div className="mt-5">
                <Notice
                  type={
                    message.toLowerCase().includes("success") ||
                    message.toLowerCase().includes("acknowledged")
                      ? "success"
                      : "error"
                  }
                >
                  {message}
                </Notice>
              </div>
            )}
          </Card>
          <Card className="h-fit">
            <div className="flex items-center justify-between">
              <h2 className="font-black">Submission progress</h2>
              <span className="text-2xl font-black text-violet-600">
                {pct}%
              </span>
            </div>
            <div className="mt-4">
              <Progress value={pct} label={false} />
            </div>
            <p className="mt-3 text-sm text-slate-500">
              {isGroup
                ? `${progress?.confirmed_members || 0}/${progress?.total_members || 0} group members confirmed`
                : confirmed
                  ? "Your submission is confirmed"
                  : "Your submission is pending"}
            </p>
            <div className="mt-6 border-t pt-5">
              {confirmed ? (
                <Notice type="success">
                  <span>Your submission is confirmed.</span>
                </Notice>
              ) : isGroup && !isLeader ? (
                <Notice type="warning">
                  Only the group leader can acknowledge this group submission.
                  Your status updates automatically after the leader confirms.
                </Notice>
              ) : step ? (
                <div className="rounded-2xl bg-amber-50 p-4">
                  <p className="font-bold text-amber-900">
                    Confirm submission?
                  </p>
                  <p className="mt-1 text-sm text-amber-800">
                    Make sure your work is uploaded to the OneDrive folder
                    before confirming.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button loading={loading} variant="mint" onClick={confirm}>
                      Confirm
                    </Button>
                    <Button variant="ghost" onClick={() => setStep(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button className="w-full" onClick={() => setStep(true)}>
                  Yes, I have submitted
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

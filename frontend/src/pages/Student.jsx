import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Users,
  CheckCircle2,
  ExternalLink,
  Plus,
  UserPlus,
} from "lucide-react";

import Layout from "../components/Layout";
import { Card, Button, Input } from "../components/UI";
import { api } from "../services/api";

export function StudentDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [group, setGroup] = useState(null);

  useEffect(() => {
    Promise.all([api("/assignments"), api("/groups/mine")])
      .then(([assignmentData, groupData]) => {
        setAssignments(assignmentData);
        setGroup(groupData);
      })
      .catch(console.error);
  }, []);

  const assigned = assignments.filter((assignment) => assignment.assigned);

  const confirmedCount = assigned.filter(
    (assignment) => assignment.confirmed_count > 0,
  ).length;

  return (
    <Layout>
      <div className="mb-7">
        <p className="font-bold text-indigo-600">Student workspace</p>

        <h1 className="mt-1 text-3xl font-black">Your dashboard</h1>

        <p className="mt-1 text-slate-500">
          Track assignments, your group and submission progress.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <Users className="text-indigo-600" />

          <p className="mt-4 text-sm text-slate-500">My group</p>

          <p className="text-2xl font-black">{group?.name || "Not created"}</p>
        </Card>

        <Card>
          <ClipboardList className="text-indigo-600" />

          <p className="mt-4 text-sm text-slate-500">Assigned</p>

          <p className="text-2xl font-black">{assigned.length}</p>
        </Card>

        <Card>
          <CheckCircle2 className="text-emerald-600" />

          <p className="mt-4 text-sm text-slate-500">Confirmed</p>

          <p className="text-2xl font-black">{confirmedCount}</p>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">Upcoming assignments</h2>

          <Link to="/assignments" className="text-sm font-bold text-indigo-600">
            View all
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {assigned.slice(0, 5).map((assignment) => (
            <AssignmentRow key={assignment.id} a={assignment} />
          ))}

          {!assigned.length && (
            <p className="text-slate-500">No assignments assigned yet.</p>
          )}
        </div>
      </Card>
    </Layout>
  );
}

function AssignmentRow({ a }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-bold">{a.title}</p>

        <p className="text-sm text-slate-500">
          Due {new Date(a.due_date).toLocaleString()}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={a.onedrive_link}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border px-3 py-2 text-sm font-bold"
        >
          OneDrive
          <ExternalLink size={14} className="ml-1 inline" />
        </a>

        <Link
          to={`/assignments/${a.id}`}
          className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-bold text-white"
        >
          Open
        </Link>
      </div>
    </div>
  );
}

export function GroupPage() {
  const [group, setGroup] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const loadGroup = () => {
    api("/groups/mine")
      .then(setGroup)
      .catch((error) => setMessage(error.message));
  };

  useEffect(() => {
    loadGroup();
  }, []);

  const createGroup = async (event) => {
    event.preventDefault();

    try {
      await api("/groups", {
        method: "POST",
        body: {
          name,
        },
      });

      setName("");
      setMessage("Group created successfully.");
      loadGroup();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const addMember = async (event) => {
    event.preventDefault();

    try {
      await api("/groups/members", {
        method: "POST",
        body: {
          email,
        },
      });

      setEmail("");
      setMessage("Member added successfully.");
      loadGroup();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-black">My Group</h1>

      <p className="mt-1 text-slate-500">
        Create a group and add classmates by email.
      </p>

      {message && (
        <p className="mt-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-700">
          {message}
        </p>
      )}

      {!group ? (
        <Card className="mt-6 max-w-xl">
          <h2 className="text-xl font-black">Create your group</h2>

          <form onSubmit={createGroup} className="mt-4 space-y-4">
            <Input
              label="Group name"
              placeholder="Team Alpha"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />

            <Button>
              <Plus className="mr-2 inline" size={17} />
              Create group
            </Button>
          </form>
        </Card>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Users />
              </div>

              <div>
                <h2 className="text-xl font-black">{group.name}</h2>

                <p className="text-sm text-slate-500">
                  {group.members.length} member(s)
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {group.members.map((member) => (
                <div key={member.id} className="rounded-xl bg-slate-50 p-3">
                  <p className="font-semibold">{member.name}</p>

                  <p className="text-sm text-slate-500">{member.email}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-black">Add member</h2>

            <p className="mt-1 text-sm text-slate-500">
              The group creator can add a registered student.
            </p>

            <form onSubmit={addMember} className="mt-4 space-y-4">
              <Input
                label="Student email or ID"
                placeholder="student@example.com or 12"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <Button>
                <UserPlus className="mr-2 inline" size={17} />
                Add member
              </Button>
            </form>
          </Card>
        </div>
      )}
    </Layout>
  );
}

export function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    api("/assignments").then(setAssignments).catch(console.error);
  }, []);

  const assigned = assignments.filter((assignment) => assignment.assigned);

  return (
    <Layout>
      <h1 className="text-3xl font-black">Assignments</h1>

      <p className="mt-1 text-slate-500">
        Assignments available to your group.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {assigned.map((assignment) => (
          <Card key={assignment.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">{assignment.title}</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Due {new Date(assignment.due_date).toLocaleString()}
                </p>
              </div>

              {assignment.confirmed_count > 0 && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  Progress started
                </span>
              )}
            </div>

            <p className="mt-4 line-clamp-3 text-slate-600">
              {assignment.description}
            </p>

            <div className="mt-5 flex gap-2">
              <a
                href={assignment.onedrive_link}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border px-3 py-2 text-sm font-bold"
              >
                Open OneDrive
              </a>

              <Link
                to={`/assignments/${assignment.id}`}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white"
              >
                View & confirm
              </Link>
            </div>
          </Card>
        ))}

        {!assigned.length && (
          <Card className="md:col-span-2">
            <p className="text-slate-500">
              No assignments are currently assigned to your group.
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
}

export function AssignmentDetails({ id }) {
  const [assignment, setAssignment] = useState(null);
  const [progress, setProgress] = useState(null);
  const [step, setStep] = useState(false);
  const [message, setMessage] = useState("");

  const load = () => {
    Promise.all([api("/assignments"), api("/assignments/progress")])
      .then(([assignments, progressData]) => {
        setAssignment(
          assignments.find((item) => String(item.id) === String(id)),
        );

        setProgress(
          progressData.find((item) => String(item.id) === String(id)),
        );
      })
      .catch((error) => {
        setMessage(error.message);
      });
  };

  useEffect(() => {
    load();
  }, [id]);

  const confirmSubmission = async () => {
    try {
      await api(`/submissions/${id}/confirm`, {
        method: "POST",
      });

      setMessage("Submission confirmed successfully.");

      setStep(false);
      load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (!assignment) {
    return (
      <Layout>
        <Card>Loading assignment...</Card>
      </Layout>
    );
  }

  const percentage = progress
    ? Math.round((progress.confirmed_members / progress.total_members) * 100)
    : 0;

  return (
    <Layout>
      <Link to="/assignments" className="text-sm font-bold text-indigo-600">
        ← Back to assignments
      </Link>

      <Card className="mt-4 max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">{assignment.title}</h1>

            <p className="mt-2 text-slate-500">
              Due {new Date(assignment.due_date).toLocaleString()}
            </p>
          </div>
        </div>

        <p className="mt-6 leading-7 text-slate-700">
          {assignment.description}
        </p>

        <a
          href={assignment.onedrive_link}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block rounded-xl border px-4 py-2.5 font-bold"
        >
          Open OneDrive submission folder
          <ExternalLink size={16} className="ml-1 inline" />
        </a>

        {progress && (
          <div className="mt-8">
            <div className="flex justify-between text-sm font-bold">
              <span>Group progress</span>

              <span>
                {progress.confirmed_members}/{progress.total_members} confirmed
              </span>
            </div>

            <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>
          </div>
        )}

        {message && (
          <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
            {message}
          </p>
        )}

        <div className="mt-7 border-t pt-6">
          {assignment.student_confirmed ? (
            <div className="rounded-xl bg-emerald-50 p-3 font-bold text-emerald-700">
              ✓ Your submission is confirmed.
            </div>
          ) : step ? (
            <div className="rounded-2xl bg-amber-50 p-5">
              <p className="font-bold text-amber-900">Confirm submission?</p>

              <p className="mt-1 text-sm text-amber-800">
                Make sure you have uploaded the assignment to the OneDrive
                folder before confirming.
              </p>

              <div className="mt-4 flex gap-2">
                <Button onClick={confirmSubmission}>Confirm submission</Button>

                <button
                  onClick={() => setStep(false)}
                  className="rounded-xl border bg-white px-4 py-2.5 text-sm font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setStep(true)}>Yes, I have submitted</Button>
          )}
        </div>
      </Card>
    </Layout>
  );
}

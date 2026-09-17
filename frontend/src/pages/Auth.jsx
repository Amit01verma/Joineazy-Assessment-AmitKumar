import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button, Input } from "../components/UI";
export function Login() {
  const [f, setF] = useState({ email: "", password: "" }),
    [err, setErr] = useState(""),
    nav = useNavigate();
  const { login } = useAuth();
  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(f.email, f.password);
      nav("/");
    } catch (x) {
      setErr(x.message);
    }
  };
  return (
    <AuthBox title="Welcome back" subtitle="Sign in to your Joineazy workspace">
      <form onSubmit={submit} className="space-y-4">
        {err && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{err}</p>
        )}
        <Input
          label="Email"
          type="email"
          required
          value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })}
        />
        <Input
          label="Password"
          type="password"
          required
          value={f.password}
          onChange={(e) => setF({ ...f, password: e.target.value })}
        />
        <Button className="w-full">Sign in</Button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500">
        New student?{" "}
        <Link className="font-bold text-indigo-600" to="/register">
          Create account
        </Link>
      </p>
    </AuthBox>
  );
}
export function Register() {
  const [f, setF] = useState({ name: "", email: "", password: "" }),
    [err, setErr] = useState(""),
    nav = useNavigate();
  const { register } = useAuth();
  const submit = async (e) => {
    e.preventDefault();
    try {
      await register(f.name, f.email, f.password);
      nav("/dashboard");
    } catch (x) {
      setErr(x.message);
    }
  };
  return (
    <AuthBox
      title="Create student account"
      subtitle="Join your assignment workspace"
    >
      <form onSubmit={submit} className="space-y-4">
        {err && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{err}</p>
        )}
        <Input
          label="Full name"
          required
          value={f.name}
          onChange={(e) => setF({ ...f, name: e.target.value })}
        />
        <Input
          label="Email"
          type="email"
          required
          value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })}
        />
        <Input
          label="Password"
          type="password"
          minLength="6"
          required
          value={f.password}
          onChange={(e) => setF({ ...f, password: e.target.value })}
        />
        <Button className="w-full">Register</Button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500">
        Already registered?{" "}
        <Link className="font-bold text-indigo-600" to="/login">
          Sign in
        </Link>
      </p>
    </AuthBox>
  );
}
function AuthBox({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100">
      <div className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-xl">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex w-fit rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-3 text-white shadow-lg">
            <GraduationCap />
          </div>
          <h1 className="text-2xl font-black">{title}</h1>
          <p className="mt-1 text-slate-500">{subtitle}</p>
        </div>
        {children}
        <p className="mt-6 text-center text-xs text-slate-400">
          Joineazy · Student collaboration platform
        </p>
      </div>
    </div>
  );
}

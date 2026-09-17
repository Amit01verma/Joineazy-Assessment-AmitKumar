const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export async function api(path, { method = "GET", body, token = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  const t = localStorage.getItem("joineazy_token");
  if (token && t) headers.Authorization = `Bearer ${t}`;
  const r = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || "Request failed");
  return data;
}

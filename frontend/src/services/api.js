const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function api(path, { method="GET", body, token=true }={}) {
  const headers={"Content-Type":"application/json"};
  const t=localStorage.getItem("joineazy_token");
  if(token&&t) headers.Authorization=`Bearer ${t}`;
  let response;
  try {
    response=await fetch(BASE+path,{method,headers,body:body?JSON.stringify(body):undefined});
  } catch {
    throw new Error("Unable to reach the server. Please check your connection and try again.");
  }
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data.message||"Request failed");
  return data;
}

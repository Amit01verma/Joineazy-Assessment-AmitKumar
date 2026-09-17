import { createContext, useContext, useState } from "react";
import { api } from "../services/api";
const C = createContext();
export const useAuth = () => useContext(C);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("joineazy_user"));
    } catch {
      return null;
    }
  });
  const save = (d) => {
    localStorage.setItem("joineazy_token", d.token);
    localStorage.setItem("joineazy_user", JSON.stringify(d.user));
    setUser(d.user);
  };
  const login = (email, password) =>
    api("/auth/login", {
      method: "POST",
      body: { email, password },
      token: false,
    }).then(save);
  const register = (name, email, password) =>
    api("/auth/register", {
      method: "POST",
      body: { name, email, password },
      token: false,
    }).then(save);
  const logout = () => {
    localStorage.removeItem("joineazy_token");
    localStorage.removeItem("joineazy_user");
    setUser(null);
  };
  return (
    <C.Provider value={{ user, login, register, logout }}>
      {children}
    </C.Provider>
  );
}

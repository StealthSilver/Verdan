import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface AuthContextType {
  username: string;
  token: string | null;
  role: string | null;
  setUser: (username: string, token: string, role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // Load user data from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedName = localStorage.getItem("name");
    const storedRole = localStorage.getItem("role");

    if (storedToken) setToken(storedToken);
    if (storedName) setUsername(storedName);
    if (storedRole) setRole(storedRole);
  }, []);

  // Set user data including role
  const setUser = (name: string, token: string, userRole: string) => {
    setUsername(name);
    setToken(token);
    setRole(userRole);
    localStorage.setItem("name", name);
    localStorage.setItem("token", token);
    localStorage.setItem("role", userRole);
  };

  // Logout and clear all data
  const logout = () => {
    setUsername("");
    setToken(null);
    setRole(null);
    localStorage.removeItem("name");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider value={{ username, token, role, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

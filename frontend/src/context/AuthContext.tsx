import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface AuthContextType {
  username: string;
  email: string;
  token: string | null;
  role: string | null;
  avatarId: number;
  setAvatarId: (avatarId: number) => void;
  setUser: (
    username: string,
    token: string,
    role: string,
    email: string,
    avatarId?: number,
  ) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [avatarId, setAvatarIdState] = useState(0);

  // Load user data from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedName = localStorage.getItem("name");
    const storedRole = localStorage.getItem("role");
    const storedEmail = localStorage.getItem("email");
    const storedAvatar = localStorage.getItem("avatarId");

    if (storedToken) setToken(storedToken);
    if (storedName) setUsername(storedName);
    if (storedRole) setRole(storedRole);
    if (storedEmail) setEmail(storedEmail);

    const avatarFromStorage =
      storedAvatar != null && Number.isFinite(Number(storedAvatar))
        ? Number(storedAvatar)
        : null;
    if (avatarFromStorage != null) {
      setAvatarIdState(avatarFromStorage);
    }
  }, []);

  // Set user data including role
  const setUser = (
    name: string,
    token: string,
    userRole: string,
    userEmail: string,
    userAvatarId?: number,
  ) => {
    setUsername(name);
    setToken(token);
    setRole(userRole);
    setEmail(userEmail);
    if (typeof userAvatarId === "number" && Number.isFinite(userAvatarId)) {
      setAvatarIdState(userAvatarId);
      localStorage.setItem("avatarId", String(userAvatarId));
    }
    localStorage.setItem("name", name);
    localStorage.setItem("token", token);
    localStorage.setItem("role", userRole);
    localStorage.setItem("email", userEmail);
  };

  const setAvatarId = (id: number) => {
    setAvatarIdState(id);
    localStorage.setItem("avatarId", String(id));
  };

  // Logout and clear all data
  const logout = () => {
    setUsername("");
    setEmail("");
    setToken(null);
    setRole(null);
    setAvatarIdState(0);
    localStorage.removeItem("name");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("avatarId");
  };

  return (
    <AuthContext.Provider
      value={{ username, email, token, role, avatarId, setAvatarId, setUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the AuthContext
// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with provider
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

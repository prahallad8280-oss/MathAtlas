import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ApiError, apiRequest } from "./api";
import type { User } from "../types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isBooting: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "mathatlas-auth-token";
const USER_STORAGE_KEY = "mathatlas-auth-user";

function readStoredUser() {
  const rawUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

function storeSession(nextToken: string, nextUser: User) {
  localStorage.setItem(STORAGE_KEY, nextToken);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
}

function clearStoredSession() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        clearStoredSession();
        setUser(null);
        setIsBooting(false);
        return;
      }

      try {
        const currentUser = await apiRequest<User>("/auth/me", { token });
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
        setUser(currentUser);
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          clearStoredSession();
          setToken(null);
          setUser(null);
        }
      } finally {
        setIsBooting(false);
      }
    }

    void bootstrap();
  }, [token]);

  async function login(email: string, password: string) {
    const result = await apiRequest<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    storeSession(result.token, result.user);
    setToken(result.token);
    setUser(result.user);
  }

  async function register(name: string, email: string, password: string, confirmPassword: string) {
    const result = await apiRequest<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });

    storeSession(result.token, result.user);
    setToken(result.token);
    setUser(result.user);
  }

  function logout() {
    clearStoredSession();
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isBooting,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}

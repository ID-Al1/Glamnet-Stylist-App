import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiFetch, saveToken, getToken, clearToken } from "@/lib/api";

export type UserRole = "client" | "stylist" | "brand";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  handle: string;
  location: string;
  bio: string;
  repScore: number;
  jobsCount: number;
  referrals: number;
  earnings: number;
  tier: "New" | "Active" | "Rising" | "Pro" | "Elite";
  verified: boolean;
  available: boolean;
  specialties?: string[];
  avatarUrl?: string | null;
  province?: string | null;
  city?: string | null;
  dayRate?: number | null;
  halfDayRate?: number | null;
  instantBook?: boolean;
  houseCallsEnabled?: boolean;
  callOutBase?: number | null;
  callOutRate?: number | null;
  studioAvailable?: boolean;
  foundingMember?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: Partial<User> & { password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On startup, check if we have a saved token and fetch the current user
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (token) {
          const { user: me } = await apiFetch<{ user: User }>("/auth/me");
          setUser(me);
        }
      } catch {
        // Token expired or invalid — clear it and stay logged out
        await clearToken();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token, user: me } = await apiFetch<{ token: string; user: User }>("/auth/signin", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    await saveToken(token);
    setUser(me);
  }, []);

  const signUp = useCallback(async (data: Partial<User> & { password: string }) => {
    const { token, user: me } = await apiFetch<{ token: string; user: User }>("/auth/signup", {
      method: "POST",
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role ?? "client",
        handle: data.handle,
        location: data.location,
        specialties: data.specialties,
      },
      auth: false,
    });
    await saveToken(token);
    setUser(me);
  }, []);

  const signOut = useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  // Local-only update — keeps the UI in sync without a round-trip
  const updateUser = useCallback(async (data: Partial<User>) => {
    if (!user) return;
    setUser({ ...user, ...data });
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

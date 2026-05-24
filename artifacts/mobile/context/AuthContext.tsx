import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type UserRole = "client" | "stylist";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  handle: string;
  location: string;
  bio: string;
  repScore: number;
  jobs: number;
  referrals: number;
  earnings: number;
  tier: "New" | "Active" | "Rising" | "Pro" | "Elite";
  verified: boolean;
  available: boolean;
  specialties?: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: Partial<User> & { password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AUTH_KEY = "@glamnet_user";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(AUTH_KEY);
        if (raw) setUser(JSON.parse(raw));
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (email: string, _password: string) => {
    const raw = await AsyncStorage.getItem(AUTH_KEY);
    if (raw) {
      const stored: User = JSON.parse(raw);
      if (stored.email === email) {
        setUser(stored);
        return;
      }
    }
    // Demo: auto-create a user if not found
    const demo: User = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      name: "GlamNet User",
      email,
      role: "client",
      handle: "@user",
      location: "South Africa",
      bio: "",
      repScore: 0,
      jobs: 0,
      referrals: 0,
      earnings: 0,
      tier: "New",
      verified: false,
      available: false,
    };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(demo));
    setUser(demo);
  }, []);

  const signUp = useCallback(async (data: Partial<User> & { password: string }) => {
    const newUser: User = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      name: data.name ?? "New User",
      email: data.email ?? "",
      role: data.role ?? "client",
      handle: data.handle ?? `@${(data.name ?? "user").toLowerCase().replace(/\s+/g, "")}`,
      location: data.location ?? "South Africa",
      bio: data.bio ?? "",
      repScore: 0,
      jobs: 0,
      referrals: 0,
      earnings: 0,
      tier: "New",
      verified: false,
      available: data.role === "stylist" ? true : false,
      specialties: data.specialties,
    };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updated));
    setUser(updated);
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

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// On Android emulator, the computer's localhost is 10.0.2.2.
// On iOS simulator and web, localhost works directly.
const DEFAULT_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";
export const API_BASE = `http://${DEFAULT_HOST}:3000/api`;

export const TOKEN_KEY = "@glamnet_token";

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

interface ApiOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean; // default true — attach JWT header
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  { method = "GET", body, auth = true }: ApiOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = await getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, (json as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  return json as T;
}

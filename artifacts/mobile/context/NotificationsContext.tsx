import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { apiFetch } from "@/lib/api";

export type NotifType =
  | "job_match"
  | "team_invite"
  | "booking_confirmed"
  | "booking_request"
  | "payment"
  | "rep_update"
  | "system";

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  data?: Record<string, string | number>;
}

interface State {
  notifications: Notification[];
  isLoading: boolean;
}

type Action =
  | { type: "LOAD"; payload: Notification[] }
  | { type: "MARK_READ"; id: string }
  | { type: "MARK_ALL_READ" }
  | { type: "DELETE"; id: string }
  | { type: "CLEAR_ALL" }
  | { type: "SET_LOADING"; value: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD":
      return { notifications: action.payload, isLoading: false };
    case "MARK_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, read: true } : n
        ),
      };
    case "MARK_ALL_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };
    case "DELETE":
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.id),
      };
    case "CLEAR_ALL":
      return { ...state, notifications: [] };
    case "SET_LOADING":
      return { ...state, isLoading: action.value };
    default:
      return state;
  }
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { notifications: [], isLoading: true });

  const refresh = useCallback(async () => {
    try {
      const { notifications } = await apiFetch<{ notifications: Notification[] }>("/notifications");
      dispatch({ type: "LOAD", payload: notifications });
    } catch {
      dispatch({ type: "SET_LOADING", value: false });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markRead = useCallback(async (id: string) => {
    await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
    dispatch({ type: "MARK_READ", id });
  }, []);

  const markAllRead = useCallback(async () => {
    await apiFetch("/notifications/read-all", { method: "PATCH" });
    dispatch({ type: "MARK_ALL_READ" });
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    await apiFetch(`/notifications/${id}`, { method: "DELETE" });
    dispatch({ type: "DELETE", id });
  }, []);

  const clearAll = useCallback(async () => {
    await apiFetch("/notifications", { method: "DELETE" });
    dispatch({ type: "CLEAR_ALL" });
  }, []);

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications: state.notifications,
        unreadCount,
        isLoading: state.isLoading,
        refresh,
        markRead,
        markAllRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}

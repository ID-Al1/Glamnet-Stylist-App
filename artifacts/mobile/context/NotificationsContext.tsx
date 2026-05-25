import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
}

type Action =
  | { type: "LOAD"; payload: Notification[] }
  | { type: "MARK_READ"; id: string }
  | { type: "MARK_ALL_READ" }
  | { type: "DELETE"; id: string }
  | { type: "CLEAR_ALL" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD":
      return { notifications: action.payload };
    case "MARK_READ":
      return {
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, read: true } : n
        ),
      };
    case "MARK_ALL_READ":
      return {
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };
    case "DELETE":
      return {
        notifications: state.notifications.filter((n) => n.id !== action.id),
      };
    case "CLEAR_ALL":
      return { notifications: [] };
    default:
      return state;
  }
}

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "job_match",
    title: "New job match!",
    body: "Woolworths Fashion is looking for a Makeup Artist in Johannesburg — R2,800/day. Matches your profile.",
    timestamp: Date.now() - 1000 * 60 * 8,
    read: false,
    data: { talentId: "a1", rate: "R2,800" },
  },
  {
    id: "n2",
    type: "team_invite",
    title: "Team invite received",
    body: "Editorial Collective SA has invited you to join their campaign team for June 2–3.",
    timestamp: Date.now() - 1000 * 60 * 45,
    read: false,
    data: {},
  },
  {
    id: "n3",
    type: "booking_confirmed",
    title: "Booking confirmed",
    body: "Your booking with Lerato Dlamini for June 8 has been confirmed. Rate: R2,200.",
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    read: false,
    data: { talentId: "a1" },
  },
  {
    id: "n4",
    type: "payment",
    title: "Payment received",
    body: "R5,600 has been deposited to your account for the Woolworths Campaign shoot.",
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    read: true,
    data: {},
  },
  {
    id: "n5",
    type: "rep_update",
    title: "Rep Score increased",
    body: "Your Rep Score went up to 72! Complete more jobs to unlock Rising tier.",
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    read: true,
    data: {},
  },
  {
    id: "n6",
    type: "job_match",
    title: "Urgent job in Cape Town",
    body: "Cantu SA needs a Natural Hair Specialist for a TV commercial — R4,200, June 15–16.",
    timestamp: Date.now() - 1000 * 60 * 60 * 26,
    read: true,
    data: {},
  },
  {
    id: "n7",
    type: "system",
    title: "Welcome to GlamNet!",
    body: "Your profile is live. Complete your verification to unlock Instant Book and attract more clients.",
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
    read: true,
    data: {},
  },
];

const STORAGE_KEY = "@glamnet_notifications";

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { notifications: [] });

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          dispatch({ type: "LOAD", payload: JSON.parse(raw) });
        } else {
          dispatch({ type: "LOAD", payload: SEED_NOTIFICATIONS });
        }
      } catch {
        dispatch({ type: "LOAD", payload: SEED_NOTIFICATIONS });
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.notifications)).catch(() => {});
  }, [state.notifications]);

  const markRead = useCallback((id: string) => dispatch({ type: "MARK_READ", id }), []);
  const markAllRead = useCallback(() => dispatch({ type: "MARK_ALL_READ" }), []);
  const deleteNotification = useCallback((id: string) => dispatch({ type: "DELETE", id }), []);
  const clearAll = useCallback(() => dispatch({ type: "CLEAR_ALL" }), []);

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications: state.notifications,
        unreadCount,
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

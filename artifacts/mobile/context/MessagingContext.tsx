import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { apiFetch } from "@/lib/api";

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface Thread {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  participantHandle: string;
  participantType: "model" | "artist";
  participantAvatarUrl?: string | null;
  lastMessage: string;
  lastTimestamp: number;
  unreadCount: number;
  bookingContext?: string;
}

interface State {
  threads: Thread[];
  messages: Record<string, Message[]>;
  isLoading: boolean;
}

type Action =
  | { type: "LOAD_THREADS"; threads: Thread[] }
  | { type: "LOAD_MESSAGES"; threadId: string; messages: Message[] }
  | { type: "APPEND_MESSAGE"; threadId: string; message: Message; isIncoming: boolean }
  | { type: "MARK_THREAD_READ"; threadId: string }
  | { type: "ADD_THREAD"; thread: Thread }
  | { type: "SET_LOADING"; value: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD_THREADS":
      return { ...state, threads: action.threads, isLoading: false };

    case "LOAD_MESSAGES":
      return {
        ...state,
        messages: { ...state.messages, [action.threadId]: action.messages },
      };

    case "APPEND_MESSAGE": {
      const existing = state.messages[action.threadId] ?? [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.threadId]: [...existing, action.message],
        },
        threads: state.threads.map((t) =>
          t.id === action.threadId
            ? {
                ...t,
                lastMessage: action.message.text,
                lastTimestamp: action.message.timestamp,
                unreadCount: action.isIncoming ? t.unreadCount + 1 : t.unreadCount,
              }
            : t
        ),
      };
    }

    case "MARK_THREAD_READ":
      return {
        ...state,
        threads: state.threads.map((t) =>
          t.id === action.threadId ? { ...t, unreadCount: 0 } : t
        ),
        messages: {
          ...state.messages,
          [action.threadId]: (state.messages[action.threadId] ?? []).map((m) => ({
            ...m,
            read: true,
          })),
        },
      };

    case "ADD_THREAD": {
      if (state.threads.some((t) => t.id === action.thread.id)) return state;
      return {
        ...state,
        threads: [action.thread, ...state.threads],
        messages: { ...state.messages, [action.thread.id]: [] },
      };
    }

    case "SET_LOADING":
      return { ...state, isLoading: action.value };

    default:
      return state;
  }
}

interface MessagingContextType {
  threads: Thread[];
  messages: Record<string, Message[]>;
  totalUnread: number;
  isLoading: boolean;
  refreshThreads: () => Promise<void>;
  loadMessages: (threadId: string) => Promise<void>;
  sendMessage: (threadId: string, text: string) => Promise<void>;
  markThreadRead: (threadId: string) => Promise<void>;
  getThread: (threadId: string) => Thread | undefined;
  getOrCreateThread: (
    participantId: string,
    participantName: string,
    participantRole: string,
    participantHandle: string,
    participantType: "model" | "artist",
    bookingContext?: string
  ) => Promise<string>;
}

const MessagingContext = createContext<MessagingContextType | null>(null);

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { threads: [], messages: {}, isLoading: true });

  const refreshThreads = useCallback(async () => {
    try {
      const { threads } = await apiFetch<{ threads: Thread[] }>("/messages/threads");
      dispatch({ type: "LOAD_THREADS", threads });
    } catch {
      dispatch({ type: "SET_LOADING", value: false });
    }
  }, []);

  useEffect(() => {
    refreshThreads();
  }, [refreshThreads]);

  const loadMessages = useCallback(async (threadId: string) => {
    const { messages } = await apiFetch<{ messages: Message[] }>(`/messages/threads/${threadId}`);
    dispatch({ type: "LOAD_MESSAGES", threadId, messages });
  }, []);

  const sendMessage = useCallback(async (threadId: string, text: string) => {
    const { message } = await apiFetch<{ message: Message }>(`/messages/threads/${threadId}/messages`, {
      method: "POST",
      body: { text },
    });
    dispatch({ type: "APPEND_MESSAGE", threadId, message, isIncoming: false });
  }, []);

  const markThreadRead = useCallback(async (threadId: string) => {
    await apiFetch(`/messages/threads/${threadId}/read`, { method: "PATCH" });
    dispatch({ type: "MARK_THREAD_READ", threadId });
  }, []);

  const getThread = useCallback(
    (threadId: string) => state.threads.find((t) => t.id === threadId),
    [state.threads]
  );

  const getOrCreateThread = useCallback(
    async (
      participantId: string,
      participantName: string,
      participantRole: string,
      participantHandle: string,
      participantType: "model" | "artist",
      bookingContext?: string
    ): Promise<string> => {
      const existing = state.threads.find((t) => t.participantId === participantId);
      if (existing) return existing.id;

      const { conversationId } = await apiFetch<{ conversationId: string }>("/messages/threads", {
        method: "POST",
        body: { participantId, bookingContext },
      });

      dispatch({
        type: "ADD_THREAD",
        thread: {
          id: conversationId,
          participantId,
          participantName,
          participantRole,
          participantHandle,
          participantType,
          lastMessage: "",
          lastTimestamp: Date.now(),
          unreadCount: 0,
          bookingContext,
        },
      });

      return conversationId;
    },
    [state.threads]
  );

  const totalUnread = state.threads.reduce((sum, t) => sum + t.unreadCount, 0);

  return (
    <MessagingContext.Provider
      value={{
        threads: state.threads,
        messages: state.messages,
        totalUnread,
        isLoading: state.isLoading,
        refreshThreads,
        loadMessages,
        sendMessage,
        markThreadRead,
        getThread,
        getOrCreateThread,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const ctx = useContext(MessagingContext);
  if (!ctx) throw new Error("useMessaging must be used within MessagingProvider");
  return ctx;
}

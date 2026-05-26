import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  lastMessage: string;
  lastTimestamp: number;
  unreadCount: number;
  bookingContext?: string;
}

interface State {
  threads: Thread[];
  messages: Record<string, Message[]>;
}

type Action =
  | { type: "LOAD"; payload: State }
  | { type: "SEND_MESSAGE"; threadId: string; message: Message; isIncoming: boolean }
  | { type: "MARK_THREAD_READ"; threadId: string }
  | { type: "ADD_THREAD"; thread: Thread };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD":
      return action.payload;

    case "SEND_MESSAGE": {
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
                unreadCount: action.isIncoming
                  ? t.unreadCount + 1
                  : t.unreadCount,
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
        threads: [action.thread, ...state.threads],
        messages: { ...state.messages, [action.thread.id]: [] },
      };
    }

    default:
      return state;
  }
}

const STORAGE_KEY = "@glamnet_messages_v2";
const ME = "me";

const SEED_STATE: State = {
  threads: [
    {
      id: "t_a1",
      participantId: "a1",
      participantName: "Lerato Dlamini",
      participantRole: "Bridal & Editorial MUA",
      participantHandle: "@lerato_mua",
      participantType: "artist",
      lastMessage: "Also — will you need a house call or are you coming to my studio?",
      lastTimestamp: Date.now() - 1000 * 60 * 13,
      unreadCount: 2,
      bookingContext: "Bridal shoot — June 8",
    },
    {
      id: "t_a4",
      participantId: "a4",
      participantName: "Zintle Xaba",
      participantHandle: "@zintle_hair",
      participantRole: "Natural Hair Specialist",
      participantType: "artist",
      lastMessage: "The rate includes a travel kit for on-location work.",
      lastTimestamp: Date.now() - 1000 * 60 * 60 * 3,
      unreadCount: 1,
      bookingContext: "Editorial campaign",
    },
    {
      id: "t_m1",
      participantId: "m1",
      participantName: "Naledi Dube",
      participantHandle: "@naledi.model",
      participantRole: "Commercial & Editorial",
      participantType: "model",
      lastMessage: "Looking forward to it! I'll confirm by Friday.",
      lastTimestamp: Date.now() - 1000 * 60 * 60 * 24,
      unreadCount: 0,
      bookingContext: "Woolworths campaign",
    },
    {
      id: "t_a6",
      participantId: "a6",
      participantName: "Sipho Dlamini",
      participantHandle: "@sipho.photo",
      participantRole: "Campaign Photographer",
      participantType: "artist",
      lastMessage: "My studio in Cape Town is available from the 10th.",
      lastTimestamp: Date.now() - 1000 * 60 * 60 * 48,
      unreadCount: 0,
    },
  ],
  messages: {
    t_a1: [
      { id: "m1_1", threadId: "t_a1", senderId: ME, text: "Hi Lerato! I saw your profile and love your bridal work. Are you available June 8 for a shoot in Joburg?", timestamp: Date.now() - 1000 * 60 * 60 * 2, read: true },
      { id: "m1_2", threadId: "t_a1", senderId: "a1", text: "Hi! Thank you so much 😊 Let me check my calendar...", timestamp: Date.now() - 1000 * 60 * 50, read: true },
      { id: "m1_3", threadId: "t_a1", senderId: "a1", text: "Yes! I have that date open. Can you share the mood board?", timestamp: Date.now() - 1000 * 60 * 14, read: false },
      { id: "m1_4", threadId: "t_a1", senderId: "a1", text: "Also — will you need a house call or are you coming to my studio?", timestamp: Date.now() - 1000 * 60 * 13, read: false },
    ],
    t_a4: [
      { id: "m4_1", threadId: "t_a4", senderId: ME, text: "Hey Zintle! We're doing an editorial campaign with Naledi Dube and need a natural hair specialist. Interested?", timestamp: Date.now() - 1000 * 60 * 60 * 5, read: true },
      { id: "m4_2", threadId: "t_a4", senderId: "a4", text: "Absolutely, I'd love to be involved! What's the concept?", timestamp: Date.now() - 1000 * 60 * 60 * 4, read: true },
      { id: "m4_3", threadId: "t_a4", senderId: ME, text: "Think afro-futurist, rich textures, bold looks. Day rate R1,800 — does that work?", timestamp: Date.now() - 1000 * 60 * 60 * 3.5, read: true },
      { id: "m4_4", threadId: "t_a4", senderId: "a4", text: "The rate includes a travel kit for on-location work.", timestamp: Date.now() - 1000 * 60 * 60 * 3, read: false },
    ],
    t_m1: [
      { id: "m5_1", threadId: "t_m1", senderId: ME, text: "Hi Naledi! Woolworths Fashion is casting for their winter campaign. Are you available mid-June?", timestamp: Date.now() - 1000 * 60 * 60 * 26, read: true },
      { id: "m5_2", threadId: "t_m1", senderId: "m1", text: "That sounds amazing! I'm free June 12–15. What's the brief?", timestamp: Date.now() - 1000 * 60 * 60 * 25, read: true },
      { id: "m5_3", threadId: "t_m1", senderId: ME, text: "Clean, sophisticated — think neutral tones, structured silhouettes. Rate is R3,500. We'll send the full brief over.", timestamp: Date.now() - 1000 * 60 * 60 * 25, read: true },
      { id: "m5_4", threadId: "t_m1", senderId: "m1", text: "Looking forward to it! I'll confirm by Friday.", timestamp: Date.now() - 1000 * 60 * 60 * 24, read: true },
    ],
    t_a6: [
      { id: "m6_1", threadId: "t_a6", senderId: ME, text: "Sipho, love your lighting work. Do you have studio availability in early June for a product campaign?", timestamp: Date.now() - 1000 * 60 * 60 * 50, read: true },
      { id: "m6_2", threadId: "t_a6", senderId: "a6", text: "Thanks! What kind of products? And what's your timeline?", timestamp: Date.now() - 1000 * 60 * 60 * 49, read: true },
      { id: "m6_3", threadId: "t_a6", senderId: "a6", text: "My studio in Cape Town is available from the 10th.", timestamp: Date.now() - 1000 * 60 * 60 * 48, read: true },
    ],
  },
};

interface MessagingContextType {
  threads: Thread[];
  messages: Record<string, Message[]>;
  totalUnread: number;
  sendMessage: (threadId: string, text: string) => void;
  receiveMessage: (threadId: string, senderId: string, text: string) => void;
  markThreadRead: (threadId: string) => void;
  getThread: (threadId: string) => Thread | undefined;
  getOrCreateThread: (
    participantId: string,
    participantName: string,
    participantRole: string,
    participantHandle: string,
    participantType: "model" | "artist",
    bookingContext?: string
  ) => string;
}

const MessagingContext = createContext<MessagingContextType | null>(null);

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { threads: [], messages: {} });

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          dispatch({ type: "LOAD", payload: JSON.parse(raw) });
        } else {
          dispatch({ type: "LOAD", payload: SEED_STATE });
        }
      } catch {
        dispatch({ type: "LOAD", payload: SEED_STATE });
      }
    })();
  }, []);

  useEffect(() => {
    if (state.threads.length === 0 && Object.keys(state.messages).length === 0) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const sendMessage = useCallback((threadId: string, text: string) => {
    dispatch({
      type: "SEND_MESSAGE",
      threadId,
      isIncoming: false,
      message: {
        id: `${threadId}_${Date.now()}_out`,
        threadId,
        senderId: ME,
        text,
        timestamp: Date.now(),
        read: true,
      },
    });
  }, []);

  const receiveMessage = useCallback(
    (threadId: string, senderId: string, text: string) => {
      dispatch({
        type: "SEND_MESSAGE",
        threadId,
        isIncoming: true,
        message: {
          id: `${threadId}_${Date.now()}_in`,
          threadId,
          senderId,
          text,
          timestamp: Date.now(),
          read: false,
        },
      });
    },
    []
  );

  const markThreadRead = useCallback((threadId: string) => {
    dispatch({ type: "MARK_THREAD_READ", threadId });
  }, []);

  const getThread = useCallback(
    (threadId: string) => state.threads.find((t) => t.id === threadId),
    [state.threads]
  );

  const getOrCreateThread = useCallback(
    (
      participantId: string,
      participantName: string,
      participantRole: string,
      participantHandle: string,
      participantType: "model" | "artist",
      bookingContext?: string
    ): string => {
      const existing = state.threads.find((t) => t.participantId === participantId);
      if (existing) return existing.id;
      const newId = `t_${participantId}_${Date.now()}`;
      dispatch({
        type: "ADD_THREAD",
        thread: {
          id: newId,
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
      return newId;
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
        sendMessage,
        receiveMessage,
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

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { apiFetch } from "@/lib/api";
import type { ArtistCategory, Province, Talent } from "@/constants/data";

type State = { talent: Talent[]; isLoading: boolean };
type Action =
  | { type: "LOAD"; payload: Talent[] }
  | { type: "SET_LOADING"; value: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD":
      return { talent: action.payload, isLoading: false };
    case "SET_LOADING":
      return { ...state, isLoading: action.value };
    default:
      return state;
  }
}

const PROVINCE_RE = /\b(GP|WC|KZN|EC|FS|NW|MP|LP|NC)\b/;

function normaliseTalent(raw: Record<string, unknown>): Talent {
  const location = (raw.location ?? "South Africa") as string;
  const province = (location.match(PROVINCE_RE)?.[0] ?? "GP") as Province;
  const specialties = (raw.specialties as string[] | null) ?? [];
  const jobsCount = (raw.jobsCount ?? 0) as number;

  return {
    id: raw.id as string,
    name: raw.name as string,
    handle: (raw.handle ?? "") as string,
    type: "artist",
    role: specialties[0] ?? "Artist",
    repScore: (raw.repScore ?? 0) as number,
    jobs: jobsCount,
    referrals: 0,
    campaigns: 0,
    rate: "On Request",
    rateNum: 0,
    tier: (raw.tier ?? "New") as Talent["tier"],
    available: (raw.available ?? false) as boolean,
    verified: (raw.verified ?? false) as boolean,
    foundingMember: (raw.foundingMember ?? false) as boolean,
    badges: [],
    location,
    province,
    bio: (raw.bio ?? "") as string,
    artistCategory: (specialties[0] as ArtistCategory | undefined),
    settings: {
      houseCallsEnabled: false,
      callOutFee: false,
      callOutRate: 0,
      callOutBase: 0,
      studioAvailable: false,
      instantBook: false,
    },
    verification: {
      identity: (raw.verified ?? false) as boolean,
      portfolio: false,
      firstAppointment: jobsCount > 0,
      skillAssessment: false,
    },
    collaborations: [],
    portfolio: [],
  };
}

interface TalentContextType {
  talent: Talent[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const TalentContext = createContext<TalentContextType | null>(null);

export function TalentProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { talent: [], isLoading: true });

  const refresh = useCallback(async () => {
    dispatch({ type: "SET_LOADING", value: true });
    try {
      const { talent } = await apiFetch<{ talent: Record<string, unknown>[] }>("/talent");
      dispatch({ type: "LOAD", payload: talent.map(normaliseTalent) });
    } catch {
      dispatch({ type: "SET_LOADING", value: false });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <TalentContext.Provider value={{ talent: state.talent, isLoading: state.isLoading, refresh }}>
      {children}
    </TalentContext.Provider>
  );
}

export function useTalent() {
  const ctx = useContext(TalentContext);
  if (!ctx) throw new Error("useTalent must be used within TalentProvider");
  return ctx;
}

import React, { createContext, useCallback, useContext, useReducer } from "react";
import { apiFetch } from "@/lib/api";

export const JOB_TYPES = ["editorial", "commercial", "events", "social", "campaign", "film", "runway"] as const;
export type JobType = typeof JOB_TYPES[number];

export interface PortfolioItem {
  id: string;
  talentId: string;
  jobType: JobType;
  title: string;
  brandCredit?: string | null;
  agencyCredit?: string | null;
  shootDate?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  isHighlight: string;
  createdAt: number;
}

interface State {
  items: PortfolioItem[];
  isLoading: boolean;
}

type Action =
  | { type: "LOAD"; items: PortfolioItem[] }
  | { type: "ADD"; item: PortfolioItem }
  | { type: "UPDATE"; item: PortfolioItem }
  | { type: "REMOVE"; id: string }
  | { type: "SET_LOADING"; value: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD": return { ...state, items: action.items, isLoading: false };
    case "ADD": return { ...state, items: [action.item, ...state.items] };
    case "UPDATE": return { ...state, items: state.items.map((i) => i.id === action.item.id ? action.item : i) };
    case "REMOVE": return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case "SET_LOADING": return { ...state, isLoading: action.value };
    default: return state;
  }
}

interface PortfolioContextType {
  items: PortfolioItem[];
  isLoading: boolean;
  loadPortfolio: (talentId: string) => Promise<void>;
  addItem: (params: Omit<PortfolioItem, "id" | "talentId" | "createdAt">) => Promise<void>;
  updateItem: (id: string, params: Partial<PortfolioItem>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], isLoading: false });

  const loadPortfolio = useCallback(async (talentId: string) => {
    dispatch({ type: "SET_LOADING", value: true });
    try {
      const { portfolio } = await apiFetch<{ portfolio: PortfolioItem[] }>(`/portfolio/${talentId}`);
      dispatch({ type: "LOAD", items: portfolio });
    } catch {
      dispatch({ type: "SET_LOADING", value: false });
    }
  }, []);

  const addItem = useCallback(async (params: Omit<PortfolioItem, "id" | "talentId" | "createdAt">) => {
    const { item } = await apiFetch<{ item: PortfolioItem }>("/portfolio", { method: "POST", body: params });
    dispatch({ type: "ADD", item });
  }, []);

  const updateItem = useCallback(async (id: string, params: Partial<PortfolioItem>) => {
    const { item } = await apiFetch<{ item: PortfolioItem }>(`/portfolio/${id}`, { method: "PATCH", body: params });
    dispatch({ type: "UPDATE", item });
  }, []);

  const removeItem = useCallback(async (id: string) => {
    await apiFetch(`/portfolio/${id}`, { method: "DELETE" });
    dispatch({ type: "REMOVE", id });
  }, []);

  return (
    <PortfolioContext.Provider value={{ ...state, loadPortfolio, addItem, updateItem, removeItem }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}

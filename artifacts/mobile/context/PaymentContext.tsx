import React, { createContext, useContext, useReducer, useCallback } from "react";
import { useAuth } from "./AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export const SUPPORTED_CURRENCIES = ["ZAR", "NGN", "KES", "USD"] as const;
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  ZAR: "R",
  NGN: "₦",
  KES: "KSh",
  USD: "$",
};

export interface Payment {
  id: string;
  bookingId?: string;
  paystackReference: string;
  amountKobo: number;
  currency: SupportedCurrency;
  status: "pending" | "success" | "failed" | "abandoned";
  paidAt?: string;
  createdAt: string;
}

export interface FxRate {
  baseCurrency: string;
  targetCurrency: string;
  rate: string;
  fetchedAt: string;
}

interface CheckoutResult {
  checkoutUrl: string;
  accessCode: string;
  payment: Payment;
}

interface State {
  history: Payment[];
  fxRates: FxRate[];
  isLoading: boolean;
  preferredCurrency: SupportedCurrency;
}

type Action =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOAD_HISTORY"; payload: Payment[] }
  | { type: "LOAD_FX"; payload: FxRate[] }
  | { type: "SET_CURRENCY"; payload: SupportedCurrency }
  | { type: "ADD_PAYMENT"; payload: Payment }
  | { type: "UPDATE_PAYMENT"; payload: Payment };

const initialState: State = {
  history: [],
  fxRates: [],
  isLoading: false,
  preferredCurrency: "ZAR",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "LOAD_HISTORY":
      return { ...state, history: action.payload };
    case "LOAD_FX":
      return { ...state, fxRates: action.payload };
    case "SET_CURRENCY":
      return { ...state, preferredCurrency: action.payload };
    case "ADD_PAYMENT":
      return { ...state, history: [action.payload, ...state.history] };
    case "UPDATE_PAYMENT":
      return {
        ...state,
        history: state.history.map((p) => p.id === action.payload.id ? action.payload : p),
      };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

interface PaymentContextValue extends State {
  loadHistory: () => Promise<void>;
  loadFxRates: () => Promise<void>;
  initializePayment: (opts: {
    amountZar: number;
    currency?: SupportedCurrency;
    bookingId?: string;
  }) => Promise<CheckoutResult>;
  verifyPayment: (reference: string) => Promise<Payment>;
  setPreferredCurrency: (c: SupportedCurrency) => void;
  /** Convert a ZAR amount to the user's preferred currency using cached rates */
  convertFromZar: (zarAmount: number) => { amount: number; symbol: string; currency: SupportedCurrency };
}

const PaymentContext = createContext<PaymentContextValue | null>(null);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }), [token]);

  const loadHistory = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await fetch(`${API_BASE}/payments/history`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        dispatch({ type: "LOAD_HISTORY", payload: data.payments });
      }
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [authHeaders]);

  const loadFxRates = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/payments/fx`);
      if (res.ok) {
        const data = await res.json();
        dispatch({ type: "LOAD_FX", payload: data.rates });
      }
    } catch { /* silently fail — user can still pay in ZAR */ }
  }, []);

  const initializePayment = useCallback(async (opts: {
    amountZar: number;
    currency?: SupportedCurrency;
    bookingId?: string;
  }): Promise<CheckoutResult> => {
    const res = await fetch(`${API_BASE}/payments/initialize`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        amountZar: opts.amountZar,
        currency: opts.currency ?? state.preferredCurrency,
        bookingId: opts.bookingId,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Payment initialization failed");
    }
    const data = await res.json();
    dispatch({ type: "ADD_PAYMENT", payload: data.payment });
    return { checkoutUrl: data.checkoutUrl, accessCode: data.accessCode, payment: data.payment };
  }, [authHeaders, state.preferredCurrency]);

  const verifyPayment = useCallback(async (reference: string): Promise<Payment> => {
    const res = await fetch(`${API_BASE}/payments/verify/${reference}`, { headers: authHeaders() });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Verification failed");
    }
    const data = await res.json();
    dispatch({ type: "UPDATE_PAYMENT", payload: data.payment });
    return data.payment;
  }, [authHeaders]);

  const setPreferredCurrency = useCallback((c: SupportedCurrency) => {
    dispatch({ type: "SET_CURRENCY", payload: c });
  }, []);

  const convertFromZar = useCallback((zarAmount: number) => {
    const { preferredCurrency, fxRates } = state;
    if (preferredCurrency === "ZAR") {
      return { amount: zarAmount, symbol: "R", currency: "ZAR" as SupportedCurrency };
    }
    const rate = fxRates.find(
      (r) => r.baseCurrency === "ZAR" && r.targetCurrency === preferredCurrency
    );
    const converted = rate ? zarAmount * parseFloat(rate.rate) : zarAmount;
    return {
      amount: Math.round(converted * 100) / 100,
      symbol: CURRENCY_SYMBOLS[preferredCurrency],
      currency: preferredCurrency,
    };
  }, [state]);

  return (
    <PaymentContext.Provider value={{
      ...state,
      loadHistory,
      loadFxRates,
      initializePayment,
      verifyPayment,
      setPreferredCurrency,
      convertFromZar,
    }}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const ctx = useContext(PaymentContext);
  if (!ctx) throw new Error("usePayment must be used inside <PaymentProvider>");
  return ctx;
}

import React, { createContext, useCallback, useContext, useEffect, useReducer } from "react";
import { apiFetch } from "@/lib/api";

export interface Booking {
  id: string;
  clientId: string;
  talentId: string;
  jobType: string;
  date: string;
  location: string;
  isHouseCall: boolean;
  notes: string;
  totalCost: number;
  status: "pending" | "accepted" | "declined" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  teamId?: string | null;
  teamName?: string | null;
  talentName?: string | null;
  talentHandle?: string | null;
  talentAvatarUrl?: string | null;
  clientName?: string | null;
  clientHandle?: string | null;
  clientAvatarUrl?: string | null;
}

export interface CreateBookingPayload {
  talentId: string;
  jobType: string;
  date: string;
  location: string;
  isHouseCall?: boolean;
  notes?: string;
  totalCost?: number;
  teamId?: string;
}

interface State {
  bookings: Booking[];
  isLoading: boolean;
}

type Action =
  | { type: "LOAD"; payload: Booking[] }
  | { type: "APPEND"; booking: Booking }
  | { type: "UPDATE_STATUS"; id: string; status: Booking["status"] }
  | { type: "SET_LOADING"; value: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD":
      return { bookings: action.payload, isLoading: false };
    case "APPEND":
      return { ...state, bookings: [action.booking, ...state.bookings] };
    case "UPDATE_STATUS":
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === action.id ? { ...b, status: action.status } : b,
        ),
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.value };
    default:
      return state;
  }
}

interface BookingContextType {
  bookings: Booking[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  createBooking: (payload: CreateBookingPayload) => Promise<Booking>;
  updateBookingStatus: (id: string, status: Booking["status"]) => Promise<void>;
}

const BookingContext = createContext<BookingContextType | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { bookings: [], isLoading: true });

  const refresh = useCallback(async () => {
    try {
      const { bookings } = await apiFetch<{ bookings: Booking[] }>("/bookings");
      dispatch({ type: "LOAD", payload: bookings });
    } catch {
      dispatch({ type: "SET_LOADING", value: false });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createBooking = useCallback(async (payload: CreateBookingPayload): Promise<Booking> => {
    const { booking } = await apiFetch<{ booking: Booking }>("/bookings", {
      method: "POST",
      body: payload,
    });
    dispatch({ type: "APPEND", booking });
    return booking;
  }, []);

  const updateBookingStatus = useCallback(async (id: string, status: Booking["status"]) => {
    await apiFetch(`/bookings/${id}/status`, { method: "PATCH", body: { status } });
    dispatch({ type: "UPDATE_STATUS", id, status });
  }, []);

  return (
    <BookingContext.Provider
      value={{
        bookings: state.bookings,
        isLoading: state.isLoading,
        refresh,
        createBooking,
        updateBookingStatus,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBookings must be used within BookingProvider");
  return ctx;
}

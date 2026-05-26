import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { JobRole } from "@/constants/jobs";

export interface Application {
  jobId: string;
  role: JobRole;
  message: string;
  appliedAt: number;
  status: "pending" | "shortlisted" | "declined";
}

type State = Record<string, Application>;

type Action =
  | { type: "LOAD"; payload: State }
  | { type: "APPLY"; application: Application }
  | { type: "WITHDRAW"; jobId: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD":
      return action.payload;
    case "APPLY":
      return { ...state, [action.application.jobId]: action.application };
    case "WITHDRAW": {
      const next = { ...state };
      delete next[action.jobId];
      return next;
    }
    default:
      return state;
  }
}

interface ApplicationsContextType {
  applications: State;
  apply: (jobId: string, role: JobRole, message: string) => void;
  withdraw: (jobId: string) => void;
  hasApplied: (jobId: string) => boolean;
  getApplication: (jobId: string) => Application | undefined;
  totalApplied: number;
}

const ApplicationsContext = createContext<ApplicationsContextType | null>(null);
const STORAGE_KEY = "@glamnet_applications";

export function ApplicationsProvider({ children }: { children: React.ReactNode }) {
  const [applications, dispatch] = useReducer(reducer, {});

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) dispatch({ type: "LOAD", payload: JSON.parse(raw) });
      } catch {
        /* keep empty */
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(applications)).catch(() => {});
  }, [applications]);

  const apply = useCallback((jobId: string, role: JobRole, message: string) => {
    dispatch({
      type: "APPLY",
      application: { jobId, role, message, appliedAt: Date.now(), status: "pending" },
    });
  }, []);

  const withdraw = useCallback((jobId: string) => {
    dispatch({ type: "WITHDRAW", jobId });
  }, []);

  const hasApplied = useCallback(
    (jobId: string) => Boolean(applications[jobId]),
    [applications]
  );

  const getApplication = useCallback(
    (jobId: string) => applications[jobId],
    [applications]
  );

  const totalApplied = Object.keys(applications).length;

  return (
    <ApplicationsContext.Provider
      value={{ applications, apply, withdraw, hasApplied, getApplication, totalApplied }}
    >
      {children}
    </ApplicationsContext.Provider>
  );
}

export function useApplications() {
  const ctx = useContext(ApplicationsContext);
  if (!ctx) throw new Error("useApplications must be used within ApplicationsProvider");
  return ctx;
}

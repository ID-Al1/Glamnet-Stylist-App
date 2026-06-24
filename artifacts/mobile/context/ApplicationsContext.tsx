import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { apiFetch } from "@/lib/api";
import type { JobRole } from "@/constants/jobs";

export interface Application {
  id: string;
  jobId: string;
  role: JobRole;
  message: string;
  appliedAt: number;
  status: "pending" | "shortlisted" | "declined";
}

// keyed by jobId for quick lookup
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
  apply: (jobId: string, role: JobRole, message: string) => Promise<void>;
  withdraw: (jobId: string) => Promise<void>;
  hasApplied: (jobId: string) => boolean;
  getApplication: (jobId: string) => Application | undefined;
  totalApplied: number;
}

const ApplicationsContext = createContext<ApplicationsContextType | null>(null);

export function ApplicationsProvider({ children }: { children: React.ReactNode }) {
  const [applications, dispatch] = useReducer(reducer, {});

  // No persistent local cache needed — state is in the database.
  // We keep an in-memory map so the UI can react instantly.

  const apply = useCallback(async (jobId: string, role: JobRole, message: string) => {
    const { application } = await apiFetch<{
      application: { id: string; jobId: string; role: string; message: string; appliedAt: string; status: string };
    }>(`/jobs/${jobId}/apply`, {
      method: "POST",
      body: { role, message },
    });

    dispatch({
      type: "APPLY",
      application: {
        id: application.id,
        jobId: application.jobId,
        role: application.role as JobRole,
        message: application.message,
        appliedAt: new Date(application.appliedAt).getTime(),
        status: application.status as Application["status"],
      },
    });
  }, []);

  // The API doesn't have a withdraw endpoint yet — remove locally only.
  // If you add DELETE /api/jobs/:id/apply later, call it here first.
  const withdraw = useCallback(async (jobId: string) => {
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

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { apiFetch } from "@/lib/api";
import type { Job } from "@/constants/jobs";

type State = { jobs: Job[]; isLoading: boolean };
type Action =
  | { type: "LOAD"; payload: Job[] }
  | { type: "SET_LOADING"; value: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD":
      return { jobs: action.payload, isLoading: false };
    case "SET_LOADING":
      return { ...state, isLoading: action.value };
    default:
      return state;
  }
}

function normaliseJob(raw: Record<string, unknown>): Job {
  return {
    id: raw.id as string,
    title: raw.title as string,
    client: raw.client as string,
    clientType: (raw.clientType ?? "Brand") as Job["clientType"],
    brief: (raw.brief ?? "") as string,
    type: raw.type as Job["type"],
    province: (raw.province ?? "") as string,
    city: (raw.city ?? "") as string,
    date: (raw.date ?? "") as string,
    deadline: (raw.deadline ?? "") as string,
    rate: (raw.rate ?? "") as string,
    rateNum: (raw.rateNum ?? 0) as number,
    urgent: (raw.urgent ?? false) as boolean,
    featured: (raw.featured ?? false) as boolean,
    roles: (raw.roles ?? []) as Job["roles"],
    spotsTotal: (raw.spotsTotal ?? 1) as number,
    spotsFilled: (raw.spotsFilled ?? 0) as number,
    requirements: (raw.requirements ?? []) as string[],
    tags: (raw.tags ?? []) as string[],
    posted: raw.createdAt
      ? new Date(raw.createdAt as string).toLocaleDateString()
      : "Recently",
  };
}

interface JobsContextType {
  jobs: Job[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const JobsContext = createContext<JobsContextType | null>(null);

export function JobsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { jobs: [], isLoading: true });

  const refresh = useCallback(async () => {
    dispatch({ type: "SET_LOADING", value: true });
    try {
      const { jobs } = await apiFetch<{ jobs: Record<string, unknown>[] }>("/jobs");
      dispatch({ type: "LOAD", payload: jobs.map(normaliseJob) });
    } catch {
      dispatch({ type: "SET_LOADING", value: false });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <JobsContext.Provider value={{ jobs: state.jobs, isLoading: state.isLoading, refresh }}>
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error("useJobs must be used within JobsProvider");
  return ctx;
}

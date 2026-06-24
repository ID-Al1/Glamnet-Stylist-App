import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { apiFetch } from "@/lib/api";
import type { Job, JobRole, JobType } from "@/constants/jobs";

export interface Applicant {
  id: string;
  talentId: string;
  name: string;
  handle: string;
  role: JobRole;
  specialty: string;
  location: string;
  repScore: number;
  tier: string;
  message: string;
  appliedAt: number;
  status: "pending" | "shortlisted" | "declined";
  avatarUrl?: string | null;
}

export interface PostedJob extends Job {
  postedByMe: true;
  applicants: Applicant[];
}

export interface PostingDraft {
  title: string;
  client: string;
  clientType: "Brand" | "Agency" | "Private";
  brief: string;
  type: JobType;
  province: string;
  city: string;
  date: string;
  deadline: string;
  rate: string;
  rateNum: number;
  urgent: boolean;
  roles: JobRole[];
  spotsTotal: number;
  requirements: string[];
  tags: string[];
}

type State = {
  myPostings: PostedJob[];
  isLoading: boolean;
};

type Action =
  | { type: "LOAD"; payload: PostedJob[] }
  | { type: "ADD"; job: PostedJob }
  | { type: "REMOVE"; jobId: string }
  | { type: "SET_APPLICANT_STATUS"; jobId: string; applicantId: string; status: Applicant["status"] }
  | { type: "SET_LOADING"; value: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD":
      return { ...state, myPostings: action.payload, isLoading: false };
    case "ADD":
      return { ...state, myPostings: [action.job, ...state.myPostings] };
    case "REMOVE":
      return { ...state, myPostings: state.myPostings.filter((j) => j.id !== action.jobId) };
    case "SET_APPLICANT_STATUS":
      return {
        ...state,
        myPostings: state.myPostings.map((j) =>
          j.id === action.jobId
            ? {
                ...j,
                applicants: j.applicants.map((a) =>
                  a.id === action.applicantId ? { ...a, status: action.status } : a
                ),
              }
            : j
        ),
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.value };
    default:
      return state;
  }
}

interface PostingsContextType {
  myPostings: PostedJob[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  addPosting: (draft: PostingDraft) => Promise<void>;
  removePosting: (jobId: string) => Promise<void>;
  shortlistApplicant: (jobId: string, applicantId: string) => Promise<void>;
  declineApplicant: (jobId: string, applicantId: string) => Promise<void>;
  pendingApplicant: (jobId: string, applicantId: string) => Promise<void>;
  totalApplicants: number;
  totalPending: number;
}

const PostingsContext = createContext<PostingsContextType | null>(null);

function normaliseJob(raw: Record<string, unknown>): PostedJob {
  const applicants: Applicant[] = ((raw.applicants as Record<string, unknown>[]) ?? []).map((a) => ({
    id: a.id as string,
    talentId: a.talentId as string,
    name: (a.name ?? "Unknown") as string,
    handle: (a.handle ?? "") as string,
    role: a.role as JobRole,
    specialty: ((a.specialties as string[] | null)?.[0] ?? a.role) as string,
    location: (a.location ?? "") as string,
    repScore: (a.repScore ?? 0) as number,
    tier: (a.tier ?? "New") as string,
    message: (a.message ?? "") as string,
    appliedAt: a.appliedAt ? new Date(a.appliedAt as string).getTime() : Date.now(),
    status: (a.status ?? "pending") as Applicant["status"],
    avatarUrl: (a.avatarUrl ?? null) as string | null,
  }));

  return {
    id: raw.id as string,
    title: raw.title as string,
    client: raw.client as string,
    clientType: (raw.clientType ?? "Brand") as PostingDraft["clientType"],
    brief: (raw.brief ?? "") as string,
    type: raw.type as JobType,
    province: (raw.province ?? "") as string,
    city: (raw.city ?? "") as string,
    date: (raw.date ?? "") as string,
    deadline: (raw.deadline ?? "") as string,
    rate: (raw.rate ?? "") as string,
    rateNum: (raw.rateNum ?? 0) as number,
    urgent: (raw.urgent ?? false) as boolean,
    featured: (raw.featured ?? false) as boolean,
    roles: (raw.roles ?? []) as JobRole[],
    spotsTotal: (raw.spotsTotal ?? 1) as number,
    spotsFilled: (raw.spotsFilled ?? 0) as number,
    requirements: (raw.requirements ?? []) as string[],
    tags: (raw.tags ?? []) as string[],
    posted: raw.createdAt
      ? new Date(raw.createdAt as string).toLocaleDateString()
      : "Recently",
    postedByMe: true,
    applicants,
  };
}

export function PostingsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { myPostings: [], isLoading: true });

  const refresh = useCallback(async () => {
    try {
      const { jobs } = await apiFetch<{ jobs: Record<string, unknown>[] }>("/jobs/mine");
      dispatch({ type: "LOAD", payload: jobs.map(normaliseJob) });
    } catch {
      dispatch({ type: "SET_LOADING", value: false });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addPosting = useCallback(async (draft: PostingDraft) => {
    const { job } = await apiFetch<{ job: Record<string, unknown> }>("/jobs", {
      method: "POST",
      body: draft,
    });
    dispatch({ type: "ADD", job: normaliseJob({ ...job, applicants: [] }) });
  }, []);

  const removePosting = useCallback(async (jobId: string) => {
    await apiFetch(`/jobs/${jobId}`, { method: "DELETE" });
    dispatch({ type: "REMOVE", jobId });
  }, []);

  const setApplicantStatus = useCallback(
    async (jobId: string, applicantId: string, status: Applicant["status"]) => {
      await apiFetch(`/jobs/${jobId}/applications/${applicantId}/status`, {
        method: "PATCH",
        body: { status },
      });
      dispatch({ type: "SET_APPLICANT_STATUS", jobId, applicantId, status });
    },
    []
  );

  const shortlistApplicant = useCallback(
    (jobId: string, applicantId: string) => setApplicantStatus(jobId, applicantId, "shortlisted"),
    [setApplicantStatus]
  );

  const declineApplicant = useCallback(
    (jobId: string, applicantId: string) => setApplicantStatus(jobId, applicantId, "declined"),
    [setApplicantStatus]
  );

  const pendingApplicant = useCallback(
    (jobId: string, applicantId: string) => setApplicantStatus(jobId, applicantId, "pending"),
    [setApplicantStatus]
  );

  const totalApplicants = state.myPostings.reduce((sum, j) => sum + j.applicants.length, 0);
  const totalPending = state.myPostings.reduce(
    (sum, j) => sum + j.applicants.filter((a) => a.status === "pending").length,
    0
  );

  return (
    <PostingsContext.Provider
      value={{
        myPostings: state.myPostings,
        isLoading: state.isLoading,
        refresh,
        addPosting,
        removePosting,
        shortlistApplicant,
        declineApplicant,
        pendingApplicant,
        totalApplicants,
        totalPending,
      }}
    >
      {children}
    </PostingsContext.Provider>
  );
}

export function usePostings() {
  const ctx = useContext(PostingsContext);
  if (!ctx) throw new Error("usePostings must be used within PostingsProvider");
  return ctx;
}

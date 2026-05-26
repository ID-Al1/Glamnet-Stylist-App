import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Job, JobRole, JobType } from "@/constants/jobs";

export interface PostedJob extends Job {
  postedByMe: true;
  applicantCount: number;
}

type State = PostedJob[];

type Action =
  | { type: "LOAD"; payload: State }
  | { type: "ADD"; job: PostedJob }
  | { type: "REMOVE"; jobId: string }
  | { type: "INCREMENT_APPLICANT"; jobId: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD":
      return action.payload;
    case "ADD":
      return [action.job, ...state];
    case "REMOVE":
      return state.filter((j) => j.id !== action.jobId);
    case "INCREMENT_APPLICANT":
      return state.map((j) =>
        j.id === action.jobId ? { ...j, applicantCount: j.applicantCount + 1 } : j
      );
    default:
      return state;
  }
}

interface PostingsContextType {
  myPostings: PostedJob[];
  addPosting: (draft: PostingDraft) => void;
  removePosting: (jobId: string) => void;
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

const PostingsContext = createContext<PostingsContextType | null>(null);
const STORAGE_KEY = "@glamnet_postings";

export function PostingsProvider({ children }: { children: React.ReactNode }) {
  const [myPostings, dispatch] = useReducer(reducer, []);

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
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(myPostings)).catch(() => {});
  }, [myPostings]);

  const addPosting = useCallback((draft: PostingDraft) => {
    const job: PostedJob = {
      ...draft,
      id: `user_${Date.now()}`,
      featured: false,
      spotsFilled: 0,
      posted: "Just now",
      postedByMe: true,
      applicantCount: 0,
    };
    dispatch({ type: "ADD", job });
  }, []);

  const removePosting = useCallback((jobId: string) => {
    dispatch({ type: "REMOVE", jobId });
  }, []);

  return (
    <PostingsContext.Provider value={{ myPostings, addPosting, removePosting }}>
      {children}
    </PostingsContext.Provider>
  );
}

export function usePostings() {
  const ctx = useContext(PostingsContext);
  if (!ctx) throw new Error("usePostings must be used within PostingsProvider");
  return ctx;
}

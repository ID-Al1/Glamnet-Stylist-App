import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
}

export interface PostedJob extends Job {
  postedByMe: true;
  applicants: Applicant[];
}

type State = PostedJob[];

type Action =
  | { type: "LOAD"; payload: State }
  | { type: "ADD"; job: PostedJob }
  | { type: "REMOVE"; jobId: string }
  | { type: "ADD_APPLICANT"; jobId: string; applicant: Applicant }
  | { type: "SET_APPLICANT_STATUS"; jobId: string; applicantId: string; status: Applicant["status"] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD":
      return action.payload;
    case "ADD":
      return [action.job, ...state];
    case "REMOVE":
      return state.filter((j) => j.id !== action.jobId);
    case "ADD_APPLICANT":
      return state.map((j) =>
        j.id === action.jobId
          ? { ...j, applicants: [...j.applicants, action.applicant] }
          : j
      );
    case "SET_APPLICANT_STATUS":
      return state.map((j) =>
        j.id === action.jobId
          ? {
              ...j,
              applicants: j.applicants.map((a) =>
                a.id === action.applicantId ? { ...a, status: action.status } : a
              ),
            }
          : j
      );
    default:
      return state;
  }
}

interface PostingsContextType {
  myPostings: PostedJob[];
  addPosting: (draft: PostingDraft) => void;
  removePosting: (jobId: string) => void;
  shortlistApplicant: (jobId: string, applicantId: string) => void;
  declineApplicant: (jobId: string, applicantId: string) => void;
  pendingApplicant: (jobId: string, applicantId: string) => void;
  totalApplicants: number;
  totalPending: number;
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

const MOCK_APPLICANT_POOL: Omit<Applicant, "id" | "role" | "message" | "appliedAt" | "status">[] = [
  { talentId: "a1", name: "Lerato Dlamini", handle: "@lerato_mua", specialty: "Bridal & Editorial MUA", location: "Johannesburg, GP", repScore: 94, tier: "Elite" },
  { talentId: "a2", name: "Amara Osei", handle: "@amara_nails", specialty: "Luxury Nail Artist", location: "Cape Town, WC", repScore: 88, tier: "Pro" },
  { talentId: "a3", name: "Kefilwe Ntuli", handle: "@kefilwe.beauty", specialty: "Afro & Textured Hair", location: "Johannesburg, GP", repScore: 79, tier: "Rising" },
  { talentId: "a4", name: "Zintle Xaba", handle: "@zintle_hair", specialty: "Natural Hair Specialist", location: "Durban, KZN", repScore: 85, tier: "Pro" },
  { talentId: "a5", name: "Thandi Mokoena", handle: "@thandi.lash", specialty: "Lash & Brow Specialist", location: "Pretoria, GP", repScore: 72, tier: "Active" },
  { talentId: "a6", name: "Sipho Dlamini", handle: "@sipho.photo", specialty: "Campaign Photographer", location: "Cape Town, WC", repScore: 91, tier: "Elite" },
  { talentId: "a7", name: "Nomsa Mahlangu", handle: "@nomsa.style", specialty: "Fashion Stylist", location: "Johannesburg, GP", repScore: 83, tier: "Pro" },
  { talentId: "m1", name: "Naledi Dube", handle: "@naledi.model", specialty: "Commercial & Editorial", location: "Johannesburg, GP", repScore: 96, tier: "Elite" },
  { talentId: "m2", name: "Precious Sithole", handle: "@precious.model", specialty: "Fashion & Runway", location: "Cape Town, WC", repScore: 81, tier: "Pro" },
  { talentId: "m3", name: "Ayanda Mthembu", handle: "@ayanda.creative", specialty: "Creative & Editorial", location: "Durban, KZN", repScore: 77, tier: "Rising" },
];

const INTRO_MESSAGES = [
  "Hi! I'd love to be part of this project. My portfolio includes similar work and I'm available on the listed dates.",
  "This brief speaks directly to my work. I have strong experience in this category and would love to discuss further.",
  "I've worked on similar campaigns and believe I'd bring great value to this project. Happy to share my full portfolio.",
  "Very excited about this opportunity! I have the look and skill set you're describing. Available on the shoot dates.",
  "This is exactly the type of project I specialise in. Would love to be considered — I can provide references too.",
];

const STORAGE_KEY = "@glamnet_postings_v2";

const PostingsContext = createContext<PostingsContextType | null>(null);

function seedApplicants(draft: PostingDraft, jobId: string): Applicant[] {
  const eligible = MOCK_APPLICANT_POOL.filter((p) =>
    draft.roles.some((r) =>
      r === "MUA" ? p.specialty.includes("MUA") || p.specialty.includes("Beauty") :
      r === "Hair" ? p.specialty.includes("Hair") :
      r === "Nails" ? p.specialty.includes("Nail") :
      r === "Model" ? p.specialty.includes("Commercial") || p.specialty.includes("Fashion") || p.specialty.includes("Editorial") || p.specialty.includes("Creative") :
      r === "Photographer" ? p.specialty.includes("Photographer") :
      r === "Stylist" ? p.specialty.includes("Stylist") :
      r === "Lash & Brow" ? p.specialty.includes("Lash") :
      false
    )
  );

  const count = Math.max(1, Math.min(eligible.length, 2 + Math.floor(Math.random() * 3)));
  const selected = [...eligible].sort(() => Math.random() - 0.5).slice(0, count);

  return selected.map((p, i) => {
    const matchingRole = draft.roles.find((r) =>
      r === "MUA" ? p.specialty.includes("MUA") || p.specialty.includes("Beauty") :
      r === "Hair" ? p.specialty.includes("Hair") :
      r === "Nails" ? p.specialty.includes("Nail") :
      r === "Model" ? ["Commercial", "Fashion", "Editorial", "Creative"].some((s) => p.specialty.includes(s)) :
      r === "Photographer" ? p.specialty.includes("Photographer") :
      r === "Stylist" ? p.specialty.includes("Stylist") :
      r === "Lash & Brow" ? p.specialty.includes("Lash") :
      false
    ) ?? draft.roles[0];

    return {
      id: `${jobId}_app_${p.talentId}_${i}`,
      talentId: p.talentId,
      name: p.name,
      handle: p.handle,
      role: matchingRole,
      specialty: p.specialty,
      location: p.location,
      repScore: p.repScore,
      tier: p.tier,
      message: INTRO_MESSAGES[i % INTRO_MESSAGES.length],
      appliedAt: Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 4),
      status: "pending" as const,
    };
  });
}

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
    const jobId = `user_${Date.now()}`;
    const applicants = seedApplicants(draft, jobId);
    const job: PostedJob = {
      ...draft,
      id: jobId,
      featured: false,
      spotsFilled: 0,
      posted: "Just now",
      postedByMe: true,
      applicants,
    };
    dispatch({ type: "ADD", job });
  }, []);

  const removePosting = useCallback((jobId: string) => {
    dispatch({ type: "REMOVE", jobId });
  }, []);

  const shortlistApplicant = useCallback((jobId: string, applicantId: string) => {
    dispatch({ type: "SET_APPLICANT_STATUS", jobId, applicantId, status: "shortlisted" });
  }, []);

  const declineApplicant = useCallback((jobId: string, applicantId: string) => {
    dispatch({ type: "SET_APPLICANT_STATUS", jobId, applicantId, status: "declined" });
  }, []);

  const pendingApplicant = useCallback((jobId: string, applicantId: string) => {
    dispatch({ type: "SET_APPLICANT_STATUS", jobId, applicantId, status: "pending" });
  }, []);

  const totalApplicants = myPostings.reduce((sum, j) => sum + j.applicants.length, 0);
  const totalPending = myPostings.reduce(
    (sum, j) => sum + j.applicants.filter((a) => a.status === "pending").length,
    0
  );

  return (
    <PostingsContext.Provider
      value={{
        myPostings,
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

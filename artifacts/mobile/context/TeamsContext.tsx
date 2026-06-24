import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { apiFetch } from "@/lib/api";

export interface TeamMember {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string | null;
}

export interface Team {
  id: string;
  name: string;
  description?: string | null;
  dayRate?: number | null;
  isPublic: boolean;
  memberCount: number;
  members: TeamMember[];
  ownerName: string;
  ownerHandle: string;
  ownerId: string;
  createdAt: number;
}

interface State {
  discoverTeams: Team[];
  myTeams: Team[];
  isLoadingDiscover: boolean;
  isLoadingMine: boolean;
}

type Action =
  | { type: "LOAD_DISCOVER"; teams: Team[] }
  | { type: "LOAD_MINE"; teams: Team[] }
  | { type: "ADD_TEAM"; team: Team }
  | { type: "REMOVE_TEAM"; id: string }
  | { type: "UPDATE_TEAM"; team: Team }
  | { type: "SET_LOADING_DISCOVER"; value: boolean }
  | { type: "SET_LOADING_MINE"; value: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD_DISCOVER":
      return { ...state, discoverTeams: action.teams, isLoadingDiscover: false };
    case "LOAD_MINE":
      return { ...state, myTeams: action.teams, isLoadingMine: false };
    case "ADD_TEAM":
      return {
        ...state,
        myTeams: [action.team, ...state.myTeams],
        discoverTeams: action.team.isPublic
          ? [action.team, ...state.discoverTeams]
          : state.discoverTeams,
      };
    case "REMOVE_TEAM":
      return {
        ...state,
        myTeams: state.myTeams.filter((t) => t.id !== action.id),
        discoverTeams: state.discoverTeams.filter((t) => t.id !== action.id),
      };
    case "UPDATE_TEAM":
      return {
        ...state,
        discoverTeams: state.discoverTeams.map((t) => t.id === action.team.id ? action.team : t),
        myTeams: state.myTeams.map((t) => t.id === action.team.id ? action.team : t),
      };
    case "SET_LOADING_DISCOVER":
      return { ...state, isLoadingDiscover: action.value };
    case "SET_LOADING_MINE":
      return { ...state, isLoadingMine: action.value };
    default:
      return state;
  }
}

interface TeamsContextType {
  discoverTeams: Team[];
  myTeams: Team[];
  isLoadingDiscover: boolean;
  isLoadingMine: boolean;
  refreshDiscover: () => Promise<void>;
  refreshMine: () => Promise<void>;
  createTeam: (params: {
    name: string;
    description?: string;
    dayRate?: number;
    memberIds: string[];
  }) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  joinTeam: (id: string) => Promise<Team>;
  leaveTeam: (id: string) => Promise<void>;
}

const TeamsContext = createContext<TeamsContextType | null>(null);

export function TeamsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    discoverTeams: [],
    myTeams: [],
    isLoadingDiscover: true,
    isLoadingMine: true,
  });

  const refreshDiscover = useCallback(async () => {
    dispatch({ type: "SET_LOADING_DISCOVER", value: true });
    try {
      const { teams } = await apiFetch<{ teams: Team[] }>("/teams");
      dispatch({ type: "LOAD_DISCOVER", teams });
    } catch {
      dispatch({ type: "SET_LOADING_DISCOVER", value: false });
    }
  }, []);

  const refreshMine = useCallback(async () => {
    dispatch({ type: "SET_LOADING_MINE", value: true });
    try {
      const { teams } = await apiFetch<{ teams: Team[] }>("/teams/mine");
      dispatch({ type: "LOAD_MINE", teams });
    } catch {
      dispatch({ type: "SET_LOADING_MINE", value: false });
    }
  }, []);

  useEffect(() => {
    refreshDiscover();
    refreshMine();
  }, [refreshDiscover, refreshMine]);

  const createTeam = useCallback(
    async (params: { name: string; description?: string; dayRate?: number; memberIds: string[] }) => {
      const { team } = await apiFetch<{ team: Team }>("/teams", {
        method: "POST",
        body: params,
      });
      dispatch({ type: "ADD_TEAM", team });
    },
    []
  );

  const deleteTeam = useCallback(async (id: string) => {
    await apiFetch(`/teams/${id}`, { method: "DELETE" });
    dispatch({ type: "REMOVE_TEAM", id });
  }, []);

  const joinTeam = useCallback(async (id: string): Promise<Team> => {
    const { team } = await apiFetch<{ team: Team }>(`/teams/${id}/join`, { method: "POST" });
    dispatch({ type: "UPDATE_TEAM", team });
    return team;
  }, []);

  const leaveTeam = useCallback(async (id: string) => {
    await apiFetch(`/teams/${id}/leave`, { method: "DELETE" });
    await refreshDiscover();
  }, [refreshDiscover]);

  return (
    <TeamsContext.Provider
      value={{
        discoverTeams: state.discoverTeams,
        myTeams: state.myTeams,
        isLoadingDiscover: state.isLoadingDiscover,
        isLoadingMine: state.isLoadingMine,
        refreshDiscover,
        refreshMine,
        createTeam,
        deleteTeam,
        joinTeam,
        leaveTeam,
      }}
    >
      {children}
    </TeamsContext.Provider>
  );
}

export function useTeams() {
  const ctx = useContext(TeamsContext);
  if (!ctx) throw new Error("useTeams must be used within TeamsProvider");
  return ctx;
}

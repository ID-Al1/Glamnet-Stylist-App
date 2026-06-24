import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ArtistProfileSettings {
  available: boolean;
  instantBook: boolean;
  houseCallsEnabled: boolean;
  callOutBase: number;
  callOutRate: number;
  studioAvailable: boolean;
  province: string;
  city: string;
  dayRate: number;
  halfDayRate: number;
}

export interface NotificationSettings {
  jobMatches: boolean;
  bookingUpdates: boolean;
  messages: boolean;
  teamInvites: boolean;
  payments: boolean;
  repUpdates: boolean;
  marketing: boolean;
}

export interface PrivacySettings {
  publicProfile: boolean;
  showRate: boolean;
  showLocation: boolean;
  showStats: boolean;
}

export interface AppSettings {
  artist: ArtistProfileSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

const DEFAULT: AppSettings = {
  artist: {
    available: true,
    instantBook: false,
    houseCallsEnabled: false,
    callOutBase: 350,
    callOutRate: 6,
    studioAvailable: true,
    province: "GP",
    city: "Johannesburg",
    dayRate: 0,
    halfDayRate: 0,
  },
  notifications: {
    jobMatches: true,
    bookingUpdates: true,
    messages: true,
    teamInvites: true,
    payments: true,
    repUpdates: false,
    marketing: false,
  },
  privacy: {
    publicProfile: true,
    showRate: true,
    showLocation: true,
    showStats: true,
  },
};

type Action =
  | { type: "LOAD"; payload: AppSettings }
  | { type: "SET_ARTIST"; key: keyof ArtistProfileSettings; value: ArtistProfileSettings[keyof ArtistProfileSettings] }
  | { type: "SET_NOTIFICATION"; key: keyof NotificationSettings; value: boolean }
  | { type: "SET_PRIVACY"; key: keyof PrivacySettings; value: boolean }
  | { type: "RESET" };

function reducer(state: AppSettings, action: Action): AppSettings {
  switch (action.type) {
    case "LOAD":
      return action.payload;
    case "SET_ARTIST":
      return { ...state, artist: { ...state.artist, [action.key]: action.value } };
    case "SET_NOTIFICATION":
      return { ...state, notifications: { ...state.notifications, [action.key]: action.value } };
    case "SET_PRIVACY":
      return { ...state, privacy: { ...state.privacy, [action.key]: action.value } };
    case "RESET":
      return DEFAULT;
    default:
      return state;
  }
}

interface SettingsContextType {
  settings: AppSettings;
  setArtist: (key: keyof ArtistProfileSettings, value: ArtistProfileSettings[keyof ArtistProfileSettings]) => void;
  setNotification: (key: keyof NotificationSettings, value: boolean) => void;
  setPrivacy: (key: keyof PrivacySettings, value: boolean) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);
const STORAGE_KEY = "@glamnet_settings";

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, dispatch] = useReducer(reducer, DEFAULT);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) dispatch({ type: "LOAD", payload: { ...DEFAULT, ...JSON.parse(raw) } });
      } catch {
        // keep defaults
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings]);

  const setArtist = useCallback(
    (key: keyof ArtistProfileSettings, value: ArtistProfileSettings[keyof ArtistProfileSettings]) =>
      dispatch({ type: "SET_ARTIST", key, value }),
    []
  );
  const setNotification = useCallback(
    (key: keyof NotificationSettings, value: boolean) =>
      dispatch({ type: "SET_NOTIFICATION", key, value }),
    []
  );
  const setPrivacy = useCallback(
    (key: keyof PrivacySettings, value: boolean) =>
      dispatch({ type: "SET_PRIVACY", key, value }),
    []
  );
  const resetSettings = useCallback(() => dispatch({ type: "RESET" }), []);

  return (
    <SettingsContext.Provider value={{ settings, setArtist, setNotification, setPrivacy, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

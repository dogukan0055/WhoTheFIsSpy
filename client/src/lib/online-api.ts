import { apiRequest } from "./queryClient";

export type OnlineProfile = {
  playerId: string;
  name: string;
};

export type OnlinePlayer = {
  id: string;
  name: string;
  isReady: boolean;
  isHost: boolean;
  eliminated: boolean;
  lockedOutOfAsking: boolean;
  calledVote: boolean;
  role?: "spy" | "civilian";
};

export type OnlineTurn = {
  askerId: string;
  targetId?: string;
  question?: string;
  answer?: "yes" | "no";
  status: "awaiting-question" | "awaiting-answer" | "resolved";
  remainingMs: number;
};

export type ChatMessage = {
  id: string;
  senderId?: string;
  senderName?: string;
  message: string;
  createdAt: number;
  system?: boolean;
};

export type OnlineRoomState = {
  code: string;
  phase: "lobby" | "reveal" | "playing" | "voting" | "finished";
  settings: {
    spyCount: number;
    timerMinutes: number;
    locations: string[];
  };
  players: OnlinePlayer[];
  yourRole: "spy" | "civilian" | null;
  location: string | null;
  revealEndsAt?: number;
  timerEndsAt?: number;
  spiesRemaining: number;
  turn: OnlineTurn | null;
  chat: ChatMessage[];
  voteEndsAt?: number;
  lastVote?: {
    eliminatedId?: string;
    wasSpy?: boolean;
    message: string;
  };
  winner?: "spy" | "civilian";
};

type SettingsInput = {
  spyCount?: number;
  timerMinutes?: number;
  locations?: string[];
};

const withPlayer = (body: Record<string, unknown>, profile: OnlineProfile) => ({
  ...body,
  playerId: profile.playerId,
});

export const onlineApi = {
  async login(name: string): Promise<OnlineProfile> {
    const res = await apiRequest("POST", "/api/login", { name });
    const data = await res.json();
    return { playerId: data.id, name: data.name };
  },
  async createRoom(profile: OnlineProfile, settings?: SettingsInput) {
    const res = await apiRequest(
      "POST",
      "/api/rooms",
      withPlayer(settings ?? {}, profile),
    );
    return (await res.json()) as OnlineRoomState;
  },
  async joinRoom(profile: OnlineProfile, code: string) {
    const res = await apiRequest(
      "POST",
      `/api/rooms/${code}/join`,
      withPlayer({}, profile),
    );
    return (await res.json()) as OnlineRoomState;
  },
  async getState(profile: OnlineProfile, code: string) {
    const res = await apiRequest(
      "GET",
      `/api/rooms/${code}/state?playerId=${profile.playerId}`,
    );
    return (await res.json()) as OnlineRoomState;
  },
  async setReady(profile: OnlineProfile, code: string, ready: boolean) {
    const res = await apiRequest(
      "POST",
      `/api/rooms/${code}/ready`,
      withPlayer({ ready }, profile),
    );
    return (await res.json()) as OnlineRoomState;
  },
  async updateSettings(
    profile: OnlineProfile,
    code: string,
    settings: SettingsInput,
  ) {
    const res = await apiRequest(
      "POST",
      `/api/rooms/${code}/settings`,
      withPlayer(settings, profile),
    );
    return (await res.json()) as OnlineRoomState;
  },
  async start(profile: OnlineProfile, code: string) {
    const res = await apiRequest(
      "POST",
      `/api/rooms/${code}/start`,
      withPlayer({}, profile),
    );
    return (await res.json()) as OnlineRoomState;
  },
  async chat(profile: OnlineProfile, code: string, message: string) {
    const res = await apiRequest(
      "POST",
      `/api/rooms/${code}/chat`,
      withPlayer({ message }, profile),
    );
    return (await res.json()) as OnlineRoomState;
  },
  async askQuestion(
    profile: OnlineProfile,
    code: string,
    targetId: string,
    question: string,
  ) {
    const res = await apiRequest(
      "POST",
      `/api/rooms/${code}/question`,
      withPlayer({ targetId, question }, profile),
    );
    return (await res.json()) as OnlineRoomState;
  },
  async answer(profile: OnlineProfile, code: string, answer: "yes" | "no") {
    const res = await apiRequest(
      "POST",
      `/api/rooms/${code}/answer`,
      withPlayer({ answer }, profile),
    );
    return (await res.json()) as OnlineRoomState;
  },
  async callVote(profile: OnlineProfile, code: string) {
    const res = await apiRequest(
      "POST",
      `/api/rooms/${code}/call-vote`,
      withPlayer({}, profile),
    );
    return (await res.json()) as OnlineRoomState;
  },
  async vote(profile: OnlineProfile, code: string, targetId: string) {
    const res = await apiRequest(
      "POST",
      `/api/rooms/${code}/vote`,
      withPlayer({ targetId }, profile),
    );
    return (await res.json()) as OnlineRoomState;
  },
};

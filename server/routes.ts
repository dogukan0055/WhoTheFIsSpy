import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { randomUUID } from "crypto";

type Role = "spy" | "civilian";

type Session = {
  id: string;
  name: string;
  lastSeen: number;
};

type RoomPlayer = {
  id: string;
  name: string;
  isReady: boolean;
  role?: Role;
  eliminated: boolean;
  lockedOutOfAsking: boolean;
  calledVote: boolean;
};

type TurnState = {
  askerId: string;
  askWindowEndsAt: number;
  targetId?: string;
  question?: string;
  answer?: "yes" | "no";
  answerWindowEndsAt?: number;
  status: "awaiting-question" | "awaiting-answer" | "resolved";
};

type ChatMessage = {
  id: string;
  senderId?: string;
  senderName?: string;
  message: string;
  createdAt: number;
  system?: boolean;
};

type Room = {
  code: string;
  hostId: string;
  settings: {
    spyCount: number;
    timerMinutes: number;
    locations: string[];
  };
  phase: "lobby" | "reveal" | "playing" | "voting" | "finished";
  players: RoomPlayer[];
  spyIds: string[];
  location: string | null;
  revealEndsAt?: number;
  timerEndsAt?: number;
  turn?: TurnState;
  voteEndsAt?: number;
  votes: Record<string, string | undefined>;
  winner?: Role;
  chat: ChatMessage[];
  caughtSpies: number;
  lastVote?: {
    eliminatedId?: string;
    wasSpy?: boolean;
    message: string;
  };
  closedReason?: string;
};

const sessions = new Map<string, Session>();
const rooms = new Map<string, Room>();

const DEFAULT_LOCATIONS = [
  "Airport lounge",
  "Beach resort",
  "Busy hospital",
  "Mountain cabin",
  "Space station",
  "Submarine",
  "Underground bunker",
  "Art museum",
  "Concert venue",
];

const ROOM_CODE_LENGTH = 4;

function makeRoomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  if (rooms.has(code)) return makeRoomCode();
  return code;
}

function findSession(req: Request): Session | undefined {
  const playerId =
    (req.body?.playerId as string | undefined) ||
    (req.query.playerId as string | undefined);
  if (!playerId) return undefined;
  const session = sessions.get(playerId);
  if (session) {
    session.lastSeen = Date.now();
  }
  return session;
}

function requireSession(req: Request, res: Response): Session | undefined {
  const session = findSession(req);
  if (!session) {
    res.status(401).json({ message: "Login required" });
  }
  return session;
}

function getRoomOr404(code: string, res: Response): Room | undefined {
  const room = rooms.get(code.toUpperCase());
  if (!room) {
    res.status(404).json({ message: "Room not found" });
  }
  return room;
}

function addSystemMessage(room: Room, message: string) {
  room.chat.push({
    id: randomUUID(),
    message,
    createdAt: Date.now(),
    system: true,
  });
  if (room.chat.length > 120) {
    room.chat.splice(0, room.chat.length - 120);
  }
}

function resolveVote(room: Room) {
  if (!room.voteEndsAt || room.phase !== "voting") return;
  const now = Date.now();
  if (now < room.voteEndsAt) return;

  room.phase = "playing";
  const tally: Record<string, number> = {};
  Object.values(room.votes).forEach((targetId) => {
    if (!targetId) return;
    tally[targetId] = (tally[targetId] || 0) + 1;
  });

  const entries = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    addSystemMessage(room, "Vote ended with no selections.");
    room.lastVote = { message: "No votes were cast." };
    room.voteEndsAt = undefined;
    room.votes = {};
    return;
  }

  const [candidateId, votes] = entries[0];
  const topTie =
    entries.length > 1 && entries[1][1] === votes ? entries[1][0] : undefined;
  if (topTie) {
    addSystemMessage(
      room,
      "Vote tied. Nobody was eliminated, interrogation continues.",
    );
    room.lastVote = { message: "Vote tied, no elimination." };
    room.voteEndsAt = undefined;
    room.votes = {};
    return;
  }

  const candidate = room.players.find((p) => p.id === candidateId);
  if (!candidate) {
    room.lastVote = { message: "Invalid vote target." };
    room.voteEndsAt = undefined;
    room.votes = {};
    return;
  }

  candidate.eliminated = true;
  room.voteEndsAt = undefined;
  room.votes = {};

  const wasSpy = room.spyIds.includes(candidate.id);
  room.lastVote = {
    eliminatedId: candidate.id,
    wasSpy,
    message: wasSpy
      ? `${candidate.name} was a spy.`
      : `${candidate.name} was innocent.`,
  };

  if (wasSpy) {
    room.caughtSpies += 1;
    addSystemMessage(room, `${candidate.name} was a SPY.`);
  } else {
    addSystemMessage(
      room,
      `${candidate.name} was innocent. Spies gained the upper hand.`,
    );
  }

  const remainingSpies = room.spyIds.filter((id) => {
    const player = room.players.find((p) => p.id === id);
    return player && !player.eliminated;
  }).length;

  if (!wasSpy) {
    room.winner = "spy";
    room.phase = "finished";
    return;
  }

  if (remainingSpies === 0) {
    room.winner = "civilian";
    room.phase = "finished";
    return;
  }

  room.phase = "playing";
  room.turn = undefined;
}

function pickNextAsker(room: Room): string | undefined {
  const alive = room.players.filter((p) => !p.eliminated);
  const eligible = alive.filter((p) => !p.lockedOutOfAsking);
  const pool = eligible.length > 0 ? eligible : alive;
  if (pool.length === 0) return undefined;
  return pool[Math.floor(Math.random() * pool.length)].id;
}

function progressRoom(room: Room) {
  const now = Date.now();

  if (room.closedReason) {
    room.turn = undefined;
    room.voteEndsAt = undefined;
    room.phase = "finished";
    return;
  }

  if (room.phase === "finished") {
    room.turn = undefined;
    room.voteEndsAt = undefined;
    return;
  }

  if (room.phase === "reveal" && room.revealEndsAt && now >= room.revealEndsAt) {
    room.phase = "playing";
    room.timerEndsAt = now + room.settings.timerMinutes * 60 * 1000;
    room.turn = undefined;
    addSystemMessage(room, "Roles locked in. Interrogation begins.");
  }

  if (room.phase === "playing" && room.timerEndsAt && now >= room.timerEndsAt) {
    room.winner = "spy";
    room.phase = "finished";
  }

  if (room.phase === "voting") {
    resolveVote(room);
  }

  if (room.phase !== "playing") return;

  if (!room.turn) {
    const askerId = pickNextAsker(room);
    if (askerId) {
      room.turn = {
        askerId,
        askWindowEndsAt: now + 30_000,
        status: "awaiting-question",
      };
      addSystemMessage(
        room,
        `${room.players.find((p) => p.id === askerId)?.name ?? "Player"} is up to question.`,
      );
    }
    return;
  }

  const turn = room.turn;

  if (turn.status === "awaiting-question" && now >= turn.askWindowEndsAt) {
    const asker = room.players.find((p) => p.id === turn.askerId);
    if (asker) {
      asker.lockedOutOfAsking = true;
    }
    addSystemMessage(
      room,
      `${asker?.name ?? "Player"} timed out and lost their turn.`,
    );
    room.turn = undefined;
    return;
  }

  if (
    turn.status === "awaiting-answer" &&
    turn.answerWindowEndsAt &&
    now >= turn.answerWindowEndsAt &&
    !turn.answer
  ) {
    const target = room.players.find((p) => p.id === turn.targetId);
    if (target) {
      target.lockedOutOfAsking = true;
      if (room.spyIds.includes(target.id)) {
        target.eliminated = true;
        room.caughtSpies += 1;
        addSystemMessage(
          room,
          `${target.name} failed to answer and was exposed as a spy.`,
        );
        const remainingSpies = room.spyIds.filter((id) => {
          const player = room.players.find((p) => p.id === id);
          return player && !player.eliminated;
        }).length;
        if (remainingSpies === 0) {
          room.winner = "civilian";
          room.phase = "finished";
          return;
        }
      } else {
        addSystemMessage(
          room,
          `${target.name} failed to answer in time and cannot ask questions again.`,
        );
      }
    }
    room.turn = undefined;
    return;
  }
}

function serializeRoom(room: Room, viewerId: string) {
  progressRoom(room);
  const viewer = room.players.find((p) => p.id === viewerId);
  const now = Date.now();

  return {
    code: room.code,
    phase: room.phase,
    settings: room.settings,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      isReady: p.isReady,
      eliminated: p.eliminated,
      lockedOutOfAsking: p.lockedOutOfAsking,
      calledVote: p.calledVote,
      isHost: room.hostId === p.id,
      role:
        p.id === viewerId && room.phase !== "lobby"
          ? p.role
          : room.phase === "finished" && room.spyIds.includes(p.id)
            ? "spy"
            : undefined,
    })),
    yourRole: viewer?.role ?? null,
    location:
      viewer && viewer.role === "civilian" && room.location
        ? room.location
        : null,
    revealEndsAt: room.revealEndsAt,
    timerEndsAt: room.timerEndsAt,
    spiesRemaining: room.spyIds.filter((id) => {
      const player = room.players.find((p) => p.id === id);
      return player && !player.eliminated;
    }).length,
    turn: room.turn
      ? {
          ...room.turn,
          remainingMs:
            room.turn.status === "awaiting-question"
              ? Math.max(0, (room.turn.askWindowEndsAt ?? now) - now)
              : room.turn.answerWindowEndsAt
                ? Math.max(0, room.turn.answerWindowEndsAt - now)
                : 0,
        }
      : null,
    chat: room.chat.slice(-40),
    voteEndsAt: room.voteEndsAt,
    lastVote: room.lastVote,
    winner: room.winner,
    closedReason: room.closedReason,
  };
}

function validatePlayerInRoom(
  room: Room,
  playerId: string,
  res: Response,
): RoomPlayer | undefined {
  const player = room.players.find((p) => p.id === playerId);
  if (!player) {
    res.status(403).json({ message: "You are not part of this room." });
  }
  return player;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  app.post("/api/login", (req, res) => {
    const { name } = req.body ?? {};
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      res.status(400).json({ message: "Name must be at least 2 characters." });
      return;
    }
    const session: Session = {
      id: randomUUID(),
      name: name.trim().slice(0, 24),
      lastSeen: Date.now(),
    };
    sessions.set(session.id, session);
    res.json(session);
  });

  app.post("/api/rooms/:code/leave", (req, res) => {
    const session = requireSession(req, res);
    if (!session) return;
    const room = getRoomOr404(req.params.code, res);
    if (!room) return;
    const player = room.players.find((p) => p.id === session.id);
    if (!player) {
      res.status(200).json({ message: "Left" });
      return;
    }
    if (room.hostId === session.id) {
      room.closedReason = "Host left the room.";
      addSystemMessage(room, "Host left the room. Session closed.");
    } else {
      room.players = room.players.filter((p) => p.id !== session.id);
      addSystemMessage(room, `${session.name} left the room.`);
    }
    res.json(serializeRoom(room, session.id));
  });

  app.post("/api/rooms", (req, res) => {
    const session = requireSession(req, res);
    if (!session) return;
    const spyCount =
      typeof req.body?.spyCount === "number"
        ? Math.max(1, Math.min(2, Math.floor(req.body.spyCount)))
        : 1;
    const timerMinutes =
      typeof req.body?.timerMinutes === "number"
        ? Math.max(5, Math.min(25, Math.floor(req.body.timerMinutes)))
        : 10;
    const locations =
      Array.isArray(req.body?.locations) &&
      req.body.locations.every((l: unknown) => typeof l === "string")
        ? (req.body.locations as string[])
        : DEFAULT_LOCATIONS;

    const code = makeRoomCode();
    const player: RoomPlayer = {
      id: session.id,
      name: session.name,
      isReady: false,
      role: undefined,
      eliminated: false,
      lockedOutOfAsking: false,
      calledVote: false,
    };

    const room: Room = {
      code,
      hostId: session.id,
      settings: { spyCount, timerMinutes, locations },
      phase: "lobby",
      players: [player],
      spyIds: [],
      location: null,
      votes: {},
      chat: [],
      caughtSpies: 0,
    };

    rooms.set(code, room);
    addSystemMessage(room, `${session.name} created the room.`);
    res.json(serializeRoom(room, session.id));
  });

  app.post("/api/rooms/:code/join", (req, res) => {
    const session = requireSession(req, res);
    if (!session) return;
    const room = getRoomOr404(req.params.code, res);
    if (!room) return;
    const existing = room.players.find((p) => p.id === session.id);
    if (!existing) {
      room.players.push({
        id: session.id,
        name: session.name,
        isReady: false,
        role: undefined,
        eliminated: false,
        lockedOutOfAsking: false,
        calledVote: false,
      });
      addSystemMessage(room, `${session.name} joined the room.`);
    } else {
      existing.name = session.name;
    }
    res.json(serializeRoom(room, session.id));
  });

  app.get("/api/rooms/:code/state", (req, res) => {
    const session = requireSession(req, res);
    if (!session) return;
    const room = getRoomOr404(req.params.code, res);
    if (!room) return;
    if (!validatePlayerInRoom(room, session.id, res)) return;
    const payload = serializeRoom(room, session.id);
    res.json(payload);
  });

  app.post("/api/rooms/:code/ready", (req, res) => {
    const session = requireSession(req, res);
    if (!session) return;
    const room = getRoomOr404(req.params.code, res);
    if (!room) return;
    const player = validatePlayerInRoom(room, session.id, res);
    if (!player) return;
    player.isReady = Boolean(req.body?.ready);
    res.json(serializeRoom(room, session.id));
  });

  app.post("/api/rooms/:code/settings", (req, res) => {
    const session = requireSession(req, res);
    if (!session) return;
    const room = getRoomOr404(req.params.code, res);
    if (!room) return;
    if (room.hostId !== session.id) {
      res.status(403).json({ message: "Only the host can update settings." });
      return;
    }

    const spyCount =
      typeof req.body?.spyCount === "number"
        ? Math.max(1, Math.min(2, Math.floor(req.body.spyCount)))
        : room.settings.spyCount;
    const timerMinutes =
      typeof req.body?.timerMinutes === "number"
        ? Math.max(5, Math.min(25, Math.floor(req.body.timerMinutes)))
        : room.settings.timerMinutes;
    const locations =
      Array.isArray(req.body?.locations) &&
      req.body.locations.every((l: unknown) => typeof l === "string") &&
      req.body.locations.length > 0
        ? (req.body.locations as string[])
        : room.settings.locations;

    room.settings = { spyCount, timerMinutes, locations };
    addSystemMessage(room, "Host updated room settings.");
    res.json(serializeRoom(room, session.id));
  });

  app.post("/api/rooms/:code/start", (req, res) => {
    const session = requireSession(req, res);
    if (!session) return;
    const room = getRoomOr404(req.params.code, res);
    if (!room) return;
    if (room.hostId !== session.id) {
      res.status(403).json({ message: "Only the host can start the game." });
      return;
    }
    if (room.phase !== "lobby") {
      res.status(400).json({ message: "Game already started." });
      return;
    }
    const readyPlayers = room.players.filter((p) => p.isReady && !p.eliminated);
    if (readyPlayers.length < 4) {
      res.status(400).json({ message: "At least 4 ready players required." });
      return;
    }

    const rolesPool = [...readyPlayers];
    room.spyIds = [];
    room.players = readyPlayers;
    room.players.forEach((p) => {
      p.role = "civilian";
      p.eliminated = false;
      p.lockedOutOfAsking = false;
      p.calledVote = false;
    });

    let spiesAssigned = 0;
    while (
      spiesAssigned < Math.min(room.settings.spyCount, room.players.length - 1)
    ) {
      const pick =
        rolesPool[Math.floor(Math.random() * rolesPool.length)]?.id ?? null;
      const player = room.players.find((p) => p.id === pick);
      if (player && !room.spyIds.includes(player.id)) {
        room.spyIds.push(player.id);
        player.role = "spy";
        spiesAssigned++;
      }
    }

    const allLocations = room.settings.locations;
    room.location =
      allLocations[Math.floor(Math.random() * allLocations.length)] ??
      "Unknown Site";

    room.phase = "reveal";
    room.revealEndsAt = Date.now() + 5_000;
    room.timerEndsAt = undefined;
    room.turn = undefined;
    room.voteEndsAt = undefined;
    room.votes = {};
    room.winner = undefined;
    room.caughtSpies = 0;
    addSystemMessage(room, "Game launched. Reveal your roles now.");
    res.json(serializeRoom(room, session.id));
  });

  app.post("/api/rooms/:code/chat", (req, res) => {
    const session = requireSession(req, res);
    if (!session) return;
    const room = getRoomOr404(req.params.code, res);
    if (!room) return;
    if (!validatePlayerInRoom(room, session.id, res)) return;
    const text = (req.body?.message as string | undefined)?.trim();
    if (!text) {
      res.status(400).json({ message: "Message cannot be empty." });
      return;
    }
    room.chat.push({
      id: randomUUID(),
      senderId: session.id,
      senderName: session.name,
      message: text.slice(0, 240),
      createdAt: Date.now(),
    });
    res.json(serializeRoom(room, session.id));
  });

  app.post("/api/rooms/:code/question", (req, res) => {
    const session = requireSession(req, res);
    if (!session) return;
    const room = getRoomOr404(req.params.code, res);
    if (!room) return;
    const player = validatePlayerInRoom(room, session.id, res);
    if (!player) return;
    progressRoom(room);
    if (room.phase !== "playing" || !room.turn) {
      res.status(400).json({ message: "Not your turn to ask." });
      return;
    }
    if (room.turn.askerId !== player.id) {
      res.status(403).json({ message: "Wait for your turn to ask." });
      return;
    }
    if (room.turn.status !== "awaiting-question") {
      res.status(400).json({ message: "Question already asked." });
      return;
    }
    const targetId = req.body?.targetId as string | undefined;
    const target = room.players.find((p) => p.id === targetId && !p.eliminated);
    if (!target) {
      res.status(400).json({ message: "Choose a valid target." });
      return;
    }
    const question =
      ((req.body?.question as string | undefined) ?? "")
        .trim()
        .slice(0, 200) || "Is this place ...?";
    room.turn = {
      ...room.turn,
      targetId: target.id,
      question,
      status: "awaiting-answer",
      answerWindowEndsAt: Date.now() + 10_000,
    };
    room.chat.push({
      id: randomUUID(),
      senderId: player.id,
      senderName: player.name,
      message: `asks ${target.name}: ${question}`,
      createdAt: Date.now(),
    });
    res.json(serializeRoom(room, session.id));
  });

  app.post("/api/rooms/:code/answer", (req, res) => {
    const session = requireSession(req, res);
    if (!session) return;
    const room = getRoomOr404(req.params.code, res);
    if (!room) return;
    const player = validatePlayerInRoom(room, session.id, res);
    if (!player) return;
    progressRoom(room);
    if (room.phase !== "playing" || !room.turn) {
      res.status(400).json({ message: "No active question." });
      return;
    }
    if (room.turn.targetId !== player.id) {
      res.status(403).json({ message: "You are not the target." });
      return;
    }
    if (room.turn.status !== "awaiting-answer") {
      res.status(400).json({ message: "Answer already provided." });
      return;
    }
    const answer = req.body?.answer === "yes" ? "yes" : "no";
    room.turn.answer = answer;
    room.turn.status = "resolved";
    room.chat.push({
      id: randomUUID(),
      senderId: player.id,
      senderName: player.name,
      message: `${answer.toUpperCase()}`,
      createdAt: Date.now(),
    });
    room.turn = undefined;
    res.json(serializeRoom(room, session.id));
  });

  app.post("/api/rooms/:code/call-vote", (req, res) => {
    const session = requireSession(req, res);
    if (!session) return;
    const room = getRoomOr404(req.params.code, res);
    if (!room) return;
    const player = validatePlayerInRoom(room, session.id, res);
    if (!player) return;
    progressRoom(room);
    if (room.phase !== "playing") {
      res.status(400).json({ message: "Voting not allowed right now." });
      return;
    }
    if (player.calledVote) {
      res.status(400).json({ message: "You already called for a vote." });
      return;
    }
    player.calledVote = true;
    room.phase = "voting";
    room.voteEndsAt = Date.now() + 30_000;
    room.votes = {};
    addSystemMessage(room, `${player.name} called for a vote!`);
    res.json(serializeRoom(room, session.id));
  });

  app.post("/api/rooms/:code/vote", (req, res) => {
    const session = requireSession(req, res);
    if (!session) return;
    const room = getRoomOr404(req.params.code, res);
    if (!room) return;
    if (!validatePlayerInRoom(room, session.id, res)) return;
    progressRoom(room);
    if (room.phase !== "voting") {
      res.status(400).json({ message: "No active vote." });
      return;
    }
    const targetId = req.body?.targetId as string | undefined;
    const target = room.players.find((p) => p.id === targetId && !p.eliminated);
    if (!target) {
      res.status(400).json({ message: "Select a valid player." });
      return;
    }
    room.votes[session.id] = target.id;
    res.json(serializeRoom(room, session.id));
  });

  return httpServer;
}

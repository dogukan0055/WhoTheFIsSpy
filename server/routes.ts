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
  turnCursor?: number;
  voteEndsAt?: number;
  votes: Record<string, string | undefined>;
  endVotes?: Record<string, "same" | "new">;
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
  "Hospital",
  "School",
  "Police Station",
  "Supermarket",
  "Cinema",
  "Restaurant",
  "Hotel",
  "Bank",
  "Airplane",
  "Library",
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
  if (alive.length === 0) return undefined;
  const start = room.turnCursor ?? 0;
  for (let i = 0; i < alive.length; i++) {
    const idx = (start + i) % alive.length;
    const candidate = alive[idx];
    if (!candidate.lockedOutOfAsking) {
      room.turnCursor = (idx + 1) % alive.length;
      return candidate.id;
    }
  }
  // everyone locked out, pick next in order anyway
  room.turnCursor = (start + 1) % alive.length;
  return alive[start].id;
}

function progressRoom(room: Room) {
  const now = Date.now();

  if (room.closedReason) {
    room.turn = undefined;
    room.voteEndsAt = undefined;
    room.endVotes = {};
    room.phase = "finished";
    return;
  }

  if (room.phase === "finished") {
    room.turn = undefined;
    room.voteEndsAt = undefined;
    room.endVotes = room.endVotes || {};
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
    endVotes: room.endVotes ?? {},
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
    const wasSpy = room.spyIds.includes(session.id);
    room.players = room.players.filter((p) => p.id !== session.id);
    room.spyIds = room.spyIds.filter((id) => id !== session.id);
    room.turn = room.turn &&
      (room.turn.askerId === session.id || room.turn.targetId === session.id)
      ? undefined
      : room.turn;
    if (room.players.length > 0 && room.hostId === session.id) {
      room.hostId = room.players[0].id;
      addSystemMessage(room, `${session.name} left. ${room.players[0].name} is now host.`);
    } else {
      addSystemMessage(room, `${session.name} left the room.`);
    }

    if (room.phase !== "lobby" && !room.winner) {
      if (wasSpy) {
        room.winner = "civilian";
        room.phase = "finished";
        room.closedReason = "Spy disconnected. Civilians win.";
        addSystemMessage(room, "Spy disconnected. Civilians win.");
      } else {
        const activePlayers = room.players.filter((p) => !p.eliminated).length;
        if (activePlayers < 4) {
          room.winner = "spy";
          room.phase = "finished";
          room.closedReason = "Player count dropped below 4. Spies win.";
          addSystemMessage(room, "Too few players remaining. Spies win.");
        }
      }
    }

    room.turnCursor = room.turnCursor ? room.turnCursor % Math.max(room.players.length, 1) : 0;
    res.json(serializeRoom(room, session.id));
  });

  app.post("/api/rooms/:code/end-vote", (req, res) => {
    const session = requireSession(req, res);
    if (!session) return;
    const room = getRoomOr404(req.params.code, res);
    if (!room) return;
    if (!validatePlayerInRoom(room, session.id, res)) return;
    if (room.phase !== "finished") {
      res.status(400).json({ message: "End voting only available after game ends." });
      return;
    }
    const choice = req.body?.choice === "same" ? "same" : req.body?.choice === "new" ? "new" : null;
    if (!choice) {
      res.status(400).json({ message: "Invalid choice." });
      return;
    }
    room.endVotes = room.endVotes || {};
    room.endVotes[session.id] = choice;
    addSystemMessage(
      room,
      `${session.name} ${choice === "same" ? "votes to replay same settings" : "votes to replay with new settings"}.`,
    );

    const tally = Object.values(room.endVotes).reduce(
      (acc, val) => {
        acc[val] += 1;
        return acc;
      },
      { same: 0, new: 0 } as { same: number; new: number },
    );

    const canRestart = room.settings.locations.length >= 2 && room.players.length >= 4;

    if (tally.same > tally.new && tally.same >= 1 && canRestart) {
      // auto restart with same settings
      const readyPlayers = room.players.filter((p) => !p.eliminated);
      if (readyPlayers.length >= 4) {
        room.players = readyPlayers;
        room.players.forEach((p) => {
          p.isReady = true;
          p.eliminated = false;
          p.lockedOutOfAsking = false;
          p.calledVote = false;
          p.role = "civilian";
        });
        room.spyIds = [];
        let spiesAssigned = 0;
        while (
          spiesAssigned < Math.min(room.settings.spyCount, room.players.length - 1)
        ) {
          const pick =
            readyPlayers[Math.floor(Math.random() * readyPlayers.length)]?.id ?? null;
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
        room.turnCursor = 0;
        room.voteEndsAt = undefined;
        room.votes = {};
        room.winner = undefined;
        room.caughtSpies = 0;
        room.endVotes = {};
        addSystemMessage(room, "Rematch starting with same settings.");
      }
    } else if (tally.new > tally.same && tally.new >= 1) {
      // return to lobby to adjust settings
      room.phase = "lobby";
      room.spyIds = [];
      room.winner = undefined;
      room.location = null;
      room.revealEndsAt = undefined;
      room.timerEndsAt = undefined;
      room.turn = undefined;
      room.turnCursor = 0;
      room.voteEndsAt = undefined;
      room.votes = {};
      room.caughtSpies = 0;
      room.endVotes = {};
      room.players.forEach((p) => {
        p.isReady = false;
        p.eliminated = false;
        p.lockedOutOfAsking = false;
        p.calledVote = false;
        p.role = undefined;
      });
      addSystemMessage(room, "Returning to lobby to adjust settings.");
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
      req.body.locations.length >= 2
        ? (req.body.locations as string[])
        : room.settings.locations;

    room.settings = { spyCount, timerMinutes, locations };
    addSystemMessage(room, "Host updated room settings.");
    room.endVotes = {};
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
    if (room.settings.locations.length < 2) {
      res.status(400).json({ message: "At least 2 locations required." });
      return;
    }
    if (room.phase !== "lobby" && room.phase !== "finished") {
      res.status(400).json({ message: "Game already started." });
      return;
    }
    if (room.phase === "finished") {
      // Reset to lobby state while keeping players/settings
      room.players.forEach((p) => {
        p.isReady = true;
        p.eliminated = false;
        p.lockedOutOfAsking = false;
        p.calledVote = false;
      });
      room.spyIds = [];
      room.winner = undefined;
      room.closedReason = undefined;
      room.turn = undefined;
      room.turnCursor = 0;
      room.voteEndsAt = undefined;
      room.timerEndsAt = undefined;
      room.revealEndsAt = undefined;
      room.phase = "lobby";
      room.endVotes = {};
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
    room.turnCursor = 0;
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
      message: `Agent ${player.name} asks ${target.name}: ${question}`,
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
      message: `Agent ${player.name} responds: ${answer.toUpperCase()}`,
      createdAt: Date.now(),
    });
    room.turn = undefined;
    room.turnCursor = (room.turnCursor ?? 0) % Math.max(room.players.length, 1);
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

import {
  MAX_PLAYERS,
  MAX_TEAMS,
  PLAYERS_PER_TEAM,
  poolForTeamNumber,
} from "./constants";
import { createServiceClient, isSupabaseConfigured } from "./supabase/server";
import type { SlotsStatus, TeamRegistrationPayload } from "./types";

type MemoryStore = {
  teams: Array<{
    id: string;
    team_number: number;
    team_name: string;
    pool: number;
    created_at: string;
    players: Array<{
      id: string;
      slot: string;
      full_name: string;
      phone: string;
      email: string;
      cod_mobile_name: string;
    }>;
  }>;
  matches: Array<Record<string, unknown>>;
  registrationOpen: boolean;
};

declare global {
  // eslint-disable-next-line no-var
  var __uonCodStore: MemoryStore | undefined;
}

function memoryStore(): MemoryStore {
  if (!globalThis.__uonCodStore) {
    globalThis.__uonCodStore = {
      teams: [],
      matches: [],
      registrationOpen: true,
    };
  }
  return globalThis.__uonCodStore;
}

function uuid() {
  return crypto.randomUUID();
}

export async function getSlotsStatus(): Promise<SlotsStatus> {
  if (!isSupabaseConfigured()) {
    const store = memoryStore();
    const teamsRegistered = store.teams.length;
    const playersRegistered = teamsRegistered * PLAYERS_PER_TEAM;
    const isFull = teamsRegistered >= MAX_TEAMS || !store.registrationOpen;
    return {
      teamsRegistered,
      playersRegistered,
      maxTeams: MAX_TEAMS,
      maxPlayers: MAX_PLAYERS,
      slotsRemaining: Math.max(0, MAX_PLAYERS - playersRegistered),
      registrationOpen: store.registrationOpen && !isFull,
      isFull,
    };
  }

  const supabase = createServiceClient();
  const { count: teamCount } = await supabase
    .from("teams")
    .select("*", { count: "exact", head: true });

  const { data: openSetting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "registration_open")
    .maybeSingle();

  const teamsRegistered = teamCount ?? 0;
  const playersRegistered = teamsRegistered * PLAYERS_PER_TEAM;
  const registrationOpen = openSetting?.value !== false;
  const isFull = teamsRegistered >= MAX_TEAMS || !registrationOpen;

  return {
    teamsRegistered,
    playersRegistered,
    maxTeams: MAX_TEAMS,
    maxPlayers: MAX_PLAYERS,
    slotsRemaining: Math.max(0, MAX_PLAYERS - playersRegistered),
    registrationOpen: registrationOpen && !isFull,
    isFull,
  };
}

function validatePlayer(p: TeamRegistrationPayload["captain"], label: string) {
  if (!p.fullName.trim()) throw new Error(`${label}: name is required`);
  if (!p.phone.trim()) throw new Error(`${label}: phone is required`);
  if (!p.email.trim() || !p.email.includes("@")) {
    throw new Error(`${label}: valid email is required`);
  }
  if (!p.codMobileName.trim()) {
    throw new Error(`${label}: COD Mobile name is required`);
  }
}

export async function registerTeam(payload: TeamRegistrationPayload) {
  if (!payload.teamName?.trim()) {
    throw new Error("Team name is required");
  }
  validatePlayer(payload.captain, "Slot A (you)");
  validatePlayer(payload.teammates.B, "Slot B");
  validatePlayer(payload.teammates.C, "Slot C");
  validatePlayer(payload.teammates.D, "Slot D");
  validatePlayer(payload.teammates.E, "Slot E");

  const status = await getSlotsStatus();
  if (status.isFull || !status.registrationOpen) {
    const err = new Error("REGISTRATION_FULL");
    throw err;
  }

  const team_name = payload.teamName.trim();

  const roster = [
    { slot: "A", ...payload.captain },
    { slot: "B", ...payload.teammates.B },
    { slot: "C", ...payload.teammates.C },
    { slot: "D", ...payload.teammates.D },
    { slot: "E", ...payload.teammates.E },
  ];

  if (!isSupabaseConfigured()) {
    const store = memoryStore();
    const team_number = store.teams.length + 1;
    const team = {
      id: uuid(),
      team_number,
      team_name,
      pool: poolForTeamNumber(team_number),
      created_at: new Date().toISOString(),
      players: roster.map((p) => ({
        id: uuid(),
        slot: p.slot,
        full_name: p.fullName.trim(),
        phone: p.phone.trim(),
        email: p.email.trim().toLowerCase(),
        cod_mobile_name: p.codMobileName.trim(),
      })),
    };
    store.teams.push(team);
    if (store.teams.length >= MAX_TEAMS) store.registrationOpen = false;
    return {
      teamNumber: team_number,
      pool: team.pool,
      teamId: team.id,
      teamName: team_name,
    };
  }

  const supabase = createServiceClient();
  const { count } = await supabase
    .from("teams")
    .select("*", { count: "exact", head: true });
  const team_number = (count ?? 0) + 1;
  const pool = poolForTeamNumber(team_number);

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({ team_number, team_name, pool })
    .select("*")
    .single();

  if (teamError || !team) {
    throw new Error(teamError?.message || "Failed to create team");
  }

  const { error: playersError } = await supabase.from("players").insert(
    roster.map((p) => ({
      team_id: team.id,
      slot: p.slot,
      full_name: p.fullName.trim(),
      phone: p.phone.trim(),
      email: p.email.trim().toLowerCase(),
      cod_mobile_name: p.codMobileName.trim(),
    })),
  );

  if (playersError) {
    await supabase.from("teams").delete().eq("id", team.id);
    throw new Error(playersError.message);
  }

  if (team_number >= MAX_TEAMS) {
    await supabase
      .from("settings")
      .upsert({ key: "registration_open", value: false });
  }

  return { teamNumber: team_number, pool, teamId: team.id, teamName: team_name };
}

export async function getAdminData() {
  if (!isSupabaseConfigured()) {
    const store = memoryStore();
    return {
      teams: store.teams.map(({ players, ...t }) => t),
      players: store.teams.flatMap((t) =>
        t.players.map((p) => ({ ...p, team_id: t.id })),
      ),
      matches: store.matches,
      status: await getSlotsStatus(),
    };
  }

  const supabase = createServiceClient();
  const [{ data: teams }, { data: players }, { data: matches }] =
    await Promise.all([
      supabase.from("teams").select("*").order("team_number"),
      supabase.from("players").select("*").order("slot"),
      supabase.from("matches").select("*").order("match_order"),
    ]);

  return {
    teams: teams ?? [],
    players: players ?? [],
    matches: matches ?? [],
    status: await getSlotsStatus(),
  };
}

export async function upsertMatchScore(input: {
  id?: string;
  stage: string;
  pool?: number | null;
  match_order: number;
  team1_id?: string | null;
  team2_id?: string | null;
  team1_score?: number | null;
  team2_score?: number | null;
  winner_id?: string | null;
  status?: string;
  notes?: string | null;
}) {
  if (!isSupabaseConfigured()) {
    const store = memoryStore();
    if (input.id) {
      const idx = store.matches.findIndex((m) => m.id === input.id);
      if (idx >= 0) store.matches[idx] = { ...store.matches[idx], ...input };
      return store.matches[idx];
    }
    const row = { id: uuid(), created_at: new Date().toISOString(), ...input };
    store.matches.push(row);
    return row;
  }

  const supabase = createServiceClient();
  if (input.id) {
    const { data, error } = await supabase
      .from("matches")
      .update(input)
      .eq("id", input.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await supabase
    .from("matches")
    .insert(input)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function generatePoolMatches() {
  const data = await getAdminData();
  const byPool = new Map<number, typeof data.teams>();
  for (const team of data.teams) {
    const pool = (team as { pool: number }).pool;
    if (!byPool.has(pool)) byPool.set(pool, []);
    byPool.get(pool)!.push(team);
  }

  const created = [];
  for (const [pool, teams] of byPool) {
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const row = await upsertMatchScore({
          stage: "pool",
          pool,
          match_order: i * 10 + j,
          team1_id: (teams[i] as { id: string }).id,
          team2_id: (teams[j] as { id: string }).id,
          status: "pending",
        });
        created.push(row);
      }
    }
  }
  return created;
}

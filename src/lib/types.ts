import type { PlayerSlot } from "./constants";

export type PlayerInput = {
  fullName: string;
  phone: string;
  email: string;
  codMobileName: string;
};

export type TeamRegistrationPayload = {
  teamName: string;
  captain: PlayerInput;
  teammates: {
    B: PlayerInput;
    C: PlayerInput;
    D: PlayerInput;
    E: PlayerInput;
  };
};

export type TeamRow = {
  id: string;
  team_number: number;
  team_name: string | null;
  pool: number | null;
  created_at: string;
};

export type PlayerRow = {
  id: string;
  team_id: string;
  slot: PlayerSlot;
  full_name: string;
  phone: string;
  email: string;
  cod_mobile_name: string;
  created_at: string;
};

export type MatchRow = {
  id: string;
  stage: "pool" | "quarterfinal" | "semifinal" | "final";
  pool: number | null;
  match_order: number;
  team1_id: string | null;
  team2_id: string | null;
  team1_score: number | null;
  team2_score: number | null;
  winner_id: string | null;
  status: "pending" | "live" | "completed";
  notes: string | null;
  created_at: string;
};

export type SlotsStatus = {
  teamsRegistered: number;
  playersRegistered: number;
  maxTeams: number;
  maxPlayers: number;
  slotsRemaining: number;
  registrationOpen: boolean;
  isFull: boolean;
};

export const MAX_TEAMS = 20;
export const MAX_PLAYERS = 100;
export const PLAYERS_PER_TEAM = 5;
export const POOL_COUNT = 5;
export const TEAMS_PER_POOL = 4;
export const PLAYER_SLOTS = ["A", "B", "C", "D", "E"] as const;

export type PlayerSlot = (typeof PLAYER_SLOTS)[number];

export const TOURNAMENT = {
  name: "University of Nairobi Call of Duty Tournament",
  slogan: "Play • Compete • Win",
  date: "26th September 2026",
  venue: "Chiromo Campus, University of Nairobi",
  hashtags: ["#UonCallOfDuty2026", "#ChiromoCampus", "#ONUSS"],
} as const;

export function poolForTeamNumber(teamNumber: number): number {
  return Math.ceil(teamNumber / TEAMS_PER_POOL);
}

"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CodLoader } from "@/components/CodLoader";

type Team = {
  id: string;
  team_number: number;
  team_name: string | null;
  pool: number | null;
};
type Player = {
  id: string;
  team_id: string;
  slot: string;
  full_name: string;
  phone: string;
  email: string;
  cod_mobile_name: string;
};
type Match = {
  id: string;
  stage: string;
  pool: number | null;
  match_order: number;
  team1_id: string | null;
  team2_id: string | null;
  team1_score: number | null;
  team2_score: number | null;
  winner_id: string | null;
  status: string;
};

const yellow = "#ffcf00";
const panel = "#151922";
const ink = "#0b0d10";

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "teams" | "pools" | "bracket">(
    "overview",
  );
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [status, setStatus] = useState<{
    teamsRegistered: number;
    playersRegistered: number;
    maxTeams: number;
    maxPlayers: number;
    isFull: boolean;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/data");
    if (res.status === 401) {
      window.location.href = "/admin";
      return;
    }
    const data = await res.json();
    setTeams(data.teams || []);
    setPlayers(data.players || []);
    setMatches(data.matches || []);
    setStatus(data.status || null);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const teamName = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of teams) {
      map.set(t.id, `T${t.team_number} · ${t.team_name || "Squad"}`);
    }
    return map;
  }, [teams]);

  const rosterFor = (teamId: string) =>
    players
      .filter((p) => p.team_id === teamId)
      .sort((a, b) => a.slot.localeCompare(b.slot));

  async function generatePools() {
    setBusy(true);
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_pool_matches" }),
      });
      await load();
      setTab("bracket");
    } finally {
      setBusy(false);
    }
  }

  async function saveMatch(e: FormEvent<HTMLFormElement>, match: Match) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const team1_score = Number(fd.get("team1_score"));
      const team2_score = Number(fd.get("team2_score"));
      let winner_id = match.winner_id;
      if (!Number.isNaN(team1_score) && !Number.isNaN(team2_score)) {
        if (team1_score > team2_score) winner_id = match.team1_id;
        else if (team2_score > team1_score) winner_id = match.team2_id;
      }
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert_match",
          match: {
            id: match.id,
            stage: match.stage,
            pool: match.pool,
            match_order: match.match_order,
            team1_id: match.team1_id,
            team2_id: match.team2_id,
            team1_score,
            team2_score,
            winner_id,
            status: String(fd.get("status") || match.status),
          },
        }),
      });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    window.location.href = "/admin";
  }

  if (loading) return <CodLoader label="OPENING COMMAND CENTER..." />;

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: ink }}>
      {busy && <CodLoader label="UPDATING BRACKET..." />}
      <header className="border-b border-white/10" style={{ backgroundColor: "#12151a" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xl tracking-wide" style={{ fontFamily: "var(--font-display)", color: yellow }}>
              COMMAND CENTER
            </p>
            <p className="text-xs text-white/50">UoN COD Tournament Admin</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-white/60 hover:text-white">
              Public Form
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded px-3 py-1.5 text-xs"
              style={{ backgroundColor: "#2a2f38" }}
            >
              Logout
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl gap-1 px-4 pb-3">
          {(
            [
              ["overview", "Overview"],
              ["teams", "Squads"],
              ["pools", "Pools"],
              ["bracket", "Live Bracket"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className="rounded px-3 py-1.5 text-xs font-semibold tracking-wide"
              style={
                tab === id
                  ? { backgroundColor: yellow, color: "#000" }
                  : { backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)" }
              }
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {tab === "overview" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Squads", `${status?.teamsRegistered ?? 0}/${status?.maxTeams ?? 20}`],
              ["Operators", `${status?.playersRegistered ?? 0}/${status?.maxPlayers ?? 100}`],
              ["Pools", "5 x 4 teams"],
              ["Status", status?.isFull ? "LOCKED" : "OPEN"],
            ].map(([label, value]) => (
              <div key={label} className="border border-white/10 p-4" style={{ backgroundColor: panel }}>
                <p className="text-xs uppercase tracking-widest text-white/45">{label}</p>
                <p className="mt-2 text-2xl" style={{ fontFamily: "var(--font-display)", color: yellow }}>
                  {value}
                </p>
              </div>
            ))}
            <div className="border border-white/10 p-4 sm:col-span-2 lg:col-span-4" style={{ backgroundColor: panel }}>
              <p className="mb-3 text-sm text-white/70">
                Generate round-robin pool fixtures once registration is locked, then update
                scores live like a FIFA / COD tournament desk.
              </p>
              <button
                type="button"
                onClick={generatePools}
                className="px-4 py-2 text-sm font-bold text-black"
                style={{ backgroundColor: yellow }}
              >
                Generate Pool Matches
              </button>
            </div>
          </div>
        )}

        {tab === "teams" && (
          <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
            <div className="max-h-[70vh] overflow-auto border border-white/10">
              {teams.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTeam(t.id)}
                  className="block w-full border-b border-white/5 px-3 py-3 text-left text-sm"
                  style={{
                    backgroundColor:
                      selectedTeam === t.id ? "rgba(255,207,0,0.2)" : "transparent",
                  }}
                >
                  <span className="font-semibold" style={{ color: yellow }}>
                    #{t.team_number}
                  </span>{" "}
                  {t.team_name}
                  <span className="mt-1 block text-xs text-white/45">Pool {t.pool}</span>
                </button>
              ))}
              {!teams.length && (
                <p className="p-4 text-sm text-white/50">No squads registered yet.</p>
              )}
            </div>
            <div className="border border-white/10 p-4" style={{ backgroundColor: panel }}>
              {selectedTeam ? (
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-white/45">
                    <tr>
                      <th className="py-2">Slot</th>
                      <th>Name</th>
                      <th>COD Mobile</th>
                      <th>Phone</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rosterFor(selectedTeam).map((p) => (
                      <tr key={p.id} className="border-t border-white/5">
                        <td className="py-2 font-bold" style={{ color: yellow }}>
                          {p.slot}
                        </td>
                        <td>{p.full_name}</td>
                        <td>{p.cod_mobile_name}</td>
                        <td>{p.phone}</td>
                        <td className="break-all">{p.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-white/50">Select a squad to inspect roster.</p>
              )}
            </div>
          </div>
        )}

        {tab === "pools" && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5].map((pool) => (
              <div key={pool} className="border border-white/10 p-4" style={{ backgroundColor: panel }}>
                <h3 className="mb-3 text-lg" style={{ fontFamily: "var(--font-display)", color: yellow }}>
                  Pool {pool}
                </h3>
                <ul className="space-y-2 text-sm">
                  {teams
                    .filter((t) => t.pool === pool)
                    .map((t) => (
                      <li
                        key={t.id}
                        className="flex justify-between border-b border-white/5 pb-2"
                      >
                        <span>
                          #{t.team_number} {t.team_name}
                        </span>
                        <span className="text-white/40">{rosterFor(t.id).length}/5</span>
                      </li>
                    ))}
                  {!teams.filter((t) => t.pool === pool).length && (
                    <li className="text-white/40">Awaiting squads...</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        )}

        {tab === "bracket" && (
          <div className="space-y-3">
            {!matches.length && (
              <p className="text-sm text-white/50">
                No matches yet. Generate pool fixtures from Overview.
              </p>
            )}
            {matches.map((m) => (
              <form
                key={m.id}
                onSubmit={(e) => saveMatch(e, m)}
                className="grid gap-3 border border-white/10 p-4 md:grid-cols-[1fr_auto_1fr_auto] md:items-center"
                style={{ backgroundColor: panel }}
              >
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/40">
                    {m.stage}
                    {m.pool ? ` · Pool ${m.pool}` : ""} · {m.status}
                  </p>
                  <p className="mt-1 text-sm">
                    {m.team1_id ? teamName.get(m.team1_id) : "TBD"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    name="team1_score"
                    type="number"
                    min={0}
                    defaultValue={m.team1_score ?? 0}
                    className="w-16 rounded px-2 py-1 text-center"
                    style={{ border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(0,0,0,0.4)" }}
                  />
                  <span className="text-white/40">:</span>
                  <input
                    name="team2_score"
                    type="number"
                    min={0}
                    defaultValue={m.team2_score ?? 0}
                    className="w-16 rounded px-2 py-1 text-center"
                    style={{ border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(0,0,0,0.4)" }}
                  />
                </div>
                <p className="text-sm">
                  {m.team2_id ? teamName.get(m.team2_id) : "TBD"}
                </p>
                <div className="flex items-center gap-2">
                  <select
                    name="status"
                    defaultValue={m.status}
                    className="rounded px-2 py-1 text-xs"
                    style={{ border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(0,0,0,0.4)" }}
                  >
                    <option value="pending">pending</option>
                    <option value="live">live</option>
                    <option value="completed">completed</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-bold text-black"
                    style={{ backgroundColor: yellow }}
                  >
                    Save
                  </button>
                </div>
              </form>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

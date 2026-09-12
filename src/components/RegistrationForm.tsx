"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AttentionModal } from "./AttentionModal";
import { CodLoader } from "./CodLoader";
import { OperatorCarousel } from "./OperatorCarousel";
import { MissionComplete } from "./MissionComplete";
import type { PlayerInput, SlotsStatus, TeamRegistrationPayload } from "@/lib/types";
import { TOURNAMENT } from "@/lib/constants";
import { OPERATORS } from "@/lib/characters";

const emptyPlayer = (): PlayerInput => ({
  fullName: "",
  phone: "",
  email: "",
  codMobileName: "",
});

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1.5 block text-xs font-medium tracking-wide text-white/90">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 6,
  border: "1px solid #3a3a3a",
  backgroundColor: "#2a2a2a",
  padding: "10px 12px",
  fontSize: 14,
  color: "#fff",
  outline: "none",
};

function PlayerFields({
  value,
  onChange,
  emailHint,
}: {
  value: PlayerInput;
  onChange: (next: PlayerInput) => void;
  emailHint?: string;
}) {
  return (
    <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-3">
      <Field label="Full Name">
        <input
          style={inputStyle}
          value={value.fullName}
          onChange={(e) => onChange({ ...value, fullName: e.target.value })}
          placeholder="Operator name"
          required
        />
      </Field>
      <Field label="Phone Number">
        <input
          style={inputStyle}
          value={value.phone}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
          placeholder="07XXXXXXXX"
          required
        />
      </Field>
      <Field label={emailHint || "Email"}>
        <input
          type="email"
          style={inputStyle}
          value={value.email}
          onChange={(e) => onChange({ ...value, email: e.target.value })}
          placeholder="student@students.uonbi.ac.ke"
          required
        />
      </Field>
      <Field label="COD Mobile Name">
        <input
          style={inputStyle}
          value={value.codMobileName}
          onChange={(e) => onChange({ ...value, codMobileName: e.target.value })}
          placeholder="In-game username"
          required
        />
      </Field>
    </div>
  );
}

export function RegistrationForm() {
  const [booting, setBooting] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<SlotsStatus | null>(null);
  const [attention, setAttention] = useState<{ open: boolean; message: string }>(
    { open: false, message: "" },
  );
  const [success, setSuccess] = useState<{
    teamName: string;
    leadName: string;
    teamNumber: number;
    pool: number;
    operatorId: string;
  } | null>(null);
  const [teamName, setTeamName] = useState("");
  const [operatorId, setOperatorId] = useState(OPERATORS[0].id);
  const [captain, setCaptain] = useState<PlayerInput>(emptyPlayer);
  const [teammates, setTeammates] = useState({
    B: emptyPlayer(),
    C: emptyPlayer(),
    D: emptyPlayer(),
    E: emptyPlayer(),
  });
  const [openSlot, setOpenSlot] = useState<"A" | "B" | "C" | "D" | "E">("A");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/slots");
        const data = await res.json();
        if (!cancelled) {
          setStatus(data);
          if (data.isFull) {
            setAttention({
              open: true,
              message:
                "Registration Full. All 100 slots have been taken. Squad deployment is locked.",
            });
          }
        }
      } catch {
        if (!cancelled) {
          setAttention({
            open: true,
            message: "Failed to reach the deployment server. Check your connection and retry.",
          });
        }
      } finally {
        if (!cancelled) setTimeout(() => setBooting(false), 2600);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const slotsLabel = useMemo(() => {
    if (!status) return "Checking slots...";
    return `${status.playersRegistered}/${status.maxPlayers} operators · ${status.teamsRegistered}/${status.maxTeams} squads`;
  }, [status]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status?.isFull) {
      setAttention({
        open: true,
        message:
          "Registration Full. All 100 slots have been taken. Squad deployment is locked.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload: TeamRegistrationPayload = { teamName, captain, teammates };
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.status === 409 || data.code === "REGISTRATION_FULL") {
        setStatus((s) => (s ? { ...s, isFull: true, registrationOpen: false } : s));
        setAttention({
          open: true,
          message:
            "Registration Full. All 100 slots have been taken. Squad deployment is locked.",
        });
        return;
      }
      if (!res.ok) throw new Error(data.error || "Registration failed");

      setSuccess({
        teamName: data.teamName || teamName,
        leadName: captain.fullName.trim(),
        teamNumber: data.teamNumber,
        pool: data.pool,
        operatorId,
      });
      setTeamName("");
      setCaptain(emptyPlayer());
      setTeammates({
        B: emptyPlayer(),
        C: emptyPlayer(),
        D: emptyPlayer(),
        E: emptyPlayer(),
      });
      setOperatorId(OPERATORS[0].id);
      const refresh = await fetch("/api/slots");
      setStatus(await refresh.json());
    } catch (err) {
      setAttention({
        open: true,
        message: err instanceof Error ? err.message : "Registration failed.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (booting) return <CodLoader label="SYNCING LOADOUT..." />;

  if (success) {
    return (
      <MissionComplete
        teamName={success.teamName}
        leadName={success.leadName}
        teamNumber={success.teamNumber}
        pool={success.pool}
        operatorId={success.operatorId}
        captionCorner="bottom-left"
        onDone={() => setSuccess(null)}
      />
    );
  }

  return (
    <>
      {submitting && <CodLoader label="DEPLOYING SQUAD..." />}
      <AttentionModal
        open={attention.open}
        message={attention.message}
        onClose={() => setAttention((a) => ({ ...a, open: false }))}
      />

      <div className="mx-auto w-full max-w-md px-5 py-2 sm:py-4 md:px-5 md:py-2">
        <div className="overflow-hidden rounded-xl border border-white/10" style={{ backgroundColor: "#141414" }}>
          <div className="flex items-center justify-center px-5 pt-6">
            <Image
              src="/logos/uon-onuss.png"
              alt="University of Nairobi and ONUSS"
              width={1970}
              height={720}
              quality={100}
              className="h-16 w-auto max-w-full object-contain sm:h-20"
              style={{ borderRadius: 10 }}
              priority
            />
          </div>

          <h1 className="mt-5 px-6 text-center text-xl font-semibold leading-snug tracking-wide text-white" style={{ fontFamily: "var(--font-display)" }}>
            Register for the UoN Call of Duty Tournament
          </h1>
          <p className="mt-2 px-6 text-center text-xs tracking-wide text-white/55">
            {TOURNAMENT.date} · {TOURNAMENT.venue}
          </p>
          <p className="mt-1 px-6 text-center text-xs uppercase tracking-widest" style={{ color: "#ffcf00" }}>
            {slotsLabel}
          </p>

          <div className="mx-6 mt-5 h-px" style={{ backgroundColor: "#2f6fed" }} />

          <form onSubmit={onSubmit} className="px-6 py-5">
            <label className="mb-4 block">
              <span className="mb-1.5 block text-xs font-medium tracking-wide text-white/90">
                Team Name
              </span>
              <input
                style={inputStyle}
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Chiromo Ghosts"
                required
                maxLength={60}
              />
            </label>

            <div className="mb-4 flex flex-wrap gap-1.5">
              {(["A", "B", "C", "D", "E"] as const).map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setOpenSlot(slot)}
                  className="min-w-12 rounded px-3 py-1.5 text-xs font-bold tracking-wider"
                  style={
                    openSlot === slot
                      ? { backgroundColor: "#ffcf00", color: "#000" }
                      : { backgroundColor: "#2a2a2a", color: "rgba(255,255,255,0.7)" }
                  }
                >
                  {slot === "A" ? "A · YOU" : slot}
                </button>
              ))}
            </div>

            {openSlot === "A" && (
              <div>
                <p className="mb-3 text-xs uppercase tracking-widest text-white/45">
                  Slot A — Team Captain
                </p>
                <PlayerFields
                  value={captain}
                  onChange={setCaptain}
                  emailHint="School Email (preferred)"
                />
              </div>
            )}

            {(["B", "C", "D", "E"] as const).map(
              (slot) =>
                openSlot === slot && (
                  <div key={slot}>
                    <p className="mb-3 text-xs uppercase tracking-widest text-white/45">
                      Slot {slot} — Teammate
                    </p>
                    <PlayerFields
                      value={teammates[slot]}
                      onChange={(next) =>
                        setTeammates((t) => ({ ...t, [slot]: next }))
                      }
                    />
                  </div>
                ),
            )}

            <div className="my-5 border-t border-white/10 pt-4">
              <OperatorCarousel value={operatorId} onChange={setOperatorId} />
            </div>

            <button
              type="submit"
              disabled={status?.isFull}
              className="mt-4 w-full rounded-md py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: "#3a3a3a" }}
            >
              {status?.isFull ? "Registration Closed" : "Register Squad"}
            </button>

            <p className="mt-4 text-center text-xs leading-relaxed text-white/45">
              One registration locks slots A-E (5 operators). Max 20 squads · 100
              operators. Form closes at the 100th slot.
            </p>

            <p className="mt-5 border-t border-white/10 pt-4 text-center text-[11px] leading-relaxed text-white/40">
              Brought to you by the Office of the Deputy Governor and Secretary
              Corporate Affairs · Incorporated by{" "}
              <a
                href="https://designyako.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#ffcf00] underline underline-offset-2 hover:text-white"
              >
                Design Yako
              </a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

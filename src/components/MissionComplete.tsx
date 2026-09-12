"use client";

import Image from "next/image";
import { useEffect } from "react";
import { OPERATORS, POSTERS } from "@/lib/characters";
import { playMissionComplete, pulseVibrate } from "@/lib/sfx";

type Props = {
  teamName: string;
  leadName: string;
  teamNumber?: number;
  pool?: number;
  operatorId: string;
  /** "top-right" | "bottom-left" */
  captionCorner?: "top-right" | "bottom-left";
  onDone: () => void;
};

/** Clear Simon Riley poster — not an operator pick */
const SUCCESS_BG = POSTERS.success;

export function MissionComplete({
  teamName,
  leadName,
  teamNumber,
  pool,
  operatorId,
  captionCorner = "bottom-left",
  onDone,
}: Props) {
  const op =
    OPERATORS.find((o) => o.id === operatorId) || OPERATORS[0];

  useEffect(() => {
    playMissionComplete();
    pulseVibrate();
  }, []);

  const captionStyle: React.CSSProperties =
    captionCorner === "top-right"
      ? { top: "1.25rem", right: "1.25rem", textAlign: "right" }
      : { bottom: "5.5rem", left: "1.25rem", textAlign: "left" };

  return (
    <div className="mission-complete fixed inset-0 z-[95] overflow-hidden bg-black">
      <div className="absolute inset-0">
        <Image
          src={SUCCESS_BG}
          alt="Mission complete"
          fill
          priority
          quality={100}
          unoptimized
          className="object-cover object-[center_15%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/35" />
      </div>

      {/* faint WINNER watermark */}
      <p
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[58%] select-none font-black tracking-[0.2em] text-transparent"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(4rem, 18vw, 9rem)",
          WebkitTextStroke: "1px rgba(255,255,255,0.18)",
        }}
        aria-hidden
      >
        WINNER
      </p>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
        <p className="mb-2 text-xs tracking-[0.25em] text-white/70">
          UoN COD TOURNAMENT
          {teamNumber != null ? ` · TEAM #${teamNumber}` : ""}
          {pool != null ? ` · POOL ${pool}` : ""}
        </p>
        <div className="mb-3 h-px w-[min(70vw,420px)]" style={{ background: "#ffcf00" }} />
        <h2
          className="text-center text-3xl font-bold tracking-[0.12em] text-white sm:text-5xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          MISSION COMPLETE
        </h2>
        <p className="mt-4 max-w-md text-center text-sm italic text-white/80">
          Squad locked. Report to Chiromo when the call comes.
        </p>
      </div>

      <div className="absolute z-10 max-w-[70%]" style={captionStyle}>
        <p
          className="text-lg font-bold tracking-wide text-[#ffcf00] sm:text-2xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {teamName}
        </p>
        <p className="mt-1 text-sm text-white sm:text-base">
          Lead · {leadName}
        </p>
        <p className="mt-1 text-[11px] uppercase tracking-widest text-white/50">
          Operator · {op.name}
        </p>
      </div>

      <button
        type="button"
        onClick={onDone}
        className="absolute bottom-6 right-6 z-10 border border-white/80 bg-white px-5 py-2 text-sm font-bold tracking-wider text-black"
      >
        EXIT
      </button>
    </div>
  );
}

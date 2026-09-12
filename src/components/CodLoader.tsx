"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Props = {
  label?: string;
};

const STAGE_MESSAGES = [
  "Validating game settings...",
  "Getting Version Info",
  "Updating...",
  "Downloading Resources",
  "Preparing deployment...",
];

export function CodLoader({ label }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 2400;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 2.4);
      const value = Math.min(99, Math.floor(eased * 99));
      setProgress(value);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setProgress(100);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const status = useMemo(() => {
    if (label) return label;
    if (progress < 18) return STAGE_MESSAGES[0];
    if (progress < 40) return STAGE_MESSAGES[1];
    if (progress < 62) return STAGE_MESSAGES[2];
    if (progress < 85) return STAGE_MESSAGES[3];
    return STAGE_MESSAGES[4];
  }, [label, progress]);

  const showHex = !label && progress < 22;

  return (
    <div className="cod-loader-screen" role="status" aria-live="polite">
      <div className="cod-loader-bg cod-loader-bg-desktop" />
      <div className="cod-loader-bg cod-loader-bg-mobile" />
      <div className="cod-loader-veil" />

      <div className="cod-loader-brand">
        <Image
          src="/logos/cod-mobile-logo.png"
          alt="Call of Duty Mobile"
          width={501}
          height={189}
          className="cod-loader-cod-logo"
          priority
        />
        <span className="cod-loader-x" aria-hidden="true">
          x
        </span>
        <Image
          src="/logos/uon-only.png"
          alt="University of Nairobi"
          width={378}
          height={370}
          className="cod-loader-uon-logo"
          priority
        />
      </div>

      {showHex && (
        <div className="cod-loader-hex-wrap">
          <div className="cod-loader-hex">
            <svg
              className="cod-loader-hex-svg"
              viewBox="0 0 100 110"
              aria-hidden="true"
            >
              <polygon
                points="50,4 96,28 96,82 50,106 4,82 4,28"
                fill="rgba(255,255,255,0.08)"
                stroke="rgba(255,255,255,0.75)"
                strokeWidth="2.5"
              />
            </svg>
            <span className="cod-loader-hex-m">M</span>
            <span className="cod-loader-hex-bar" />
          </div>
          <p className="cod-loader-hex-status">{STAGE_MESSAGES[0]}</p>
        </div>
      )}

      <div
        className="cod-loader-footer"
        style={{ opacity: showHex ? 0 : 1, transition: "opacity 280ms ease" }}
      >
        <p className="cod-loader-status">{status}</p>
        <div className="cod-loader-track">
          <div
            className="cod-loader-fill"
            style={{ width: `${Math.max(progress, 2)}%` }}
          />
        </div>
        <p className="cod-loader-percent">{progress}%</p>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { OPERATORS, type OperatorCharacter } from "@/lib/characters";
import { celebrateSelect } from "@/lib/sfx";

const CARD_W = 112;
const GAP = 12;

type Props = {
  value: string;
  onChange: (id: string) => void;
};

export function OperatorCarousel({ value, onChange }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const lastId = useRef(value);
  const [active, setActive] = useState(value || OPERATORS[0].id);
  const [edgePad, setEdgePad] = useState(96);

  const measurePad = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // Enough side space so first & last cards can sit dead-center (fully selected)
    setEdgePad(Math.max(24, (el.clientWidth - CARD_W) / 2));
  }, []);

  useLayoutEffect(() => {
    measurePad();
    const el = scrollerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measurePad);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measurePad]);

  const syncFromScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best: OperatorCharacter = OPERATORS[0];
    let bestDist = Infinity;
    const kids = Array.from(el.querySelectorAll<HTMLElement>("[data-op-id]"));
    for (const kid of kids) {
      const center = kid.offsetLeft + kid.offsetWidth / 2;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = OPERATORS.find((o) => o.id === kid.dataset.opId) || best;
      }
    }
    if (best.id !== lastId.current) {
      lastId.current = best.id;
      setActive(best.id);
      onChange(best.id);
      celebrateSelect();
    } else {
      setActive(best.id);
    }
  }, [onChange]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        syncFromScroll();
        ticking = false;
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });

    const idx = Math.max(
      0,
      OPERATORS.findIndex((o) => o.id === (value || OPERATORS[0].id)),
    );
    requestAnimationFrame(() => {
      const kid = el.querySelectorAll<HTMLElement>("[data-op-id]")[idx];
      if (kid) {
        el.scrollLeft = kid.offsetLeft - (el.clientWidth - kid.offsetWidth) / 2;
        syncFromScroll();
      }
    });

    return () => el.removeEventListener("scroll", onScroll);
  }, [syncFromScroll, value, edgePad]);

  function selectId(id: string) {
    const el = scrollerRef.current;
    if (!el) return;
    const kid = el.querySelector<HTMLElement>(`[data-op-id="${id}"]`);
    if (!kid) return;
    el.scrollTo({
      left: kid.offsetLeft - (el.clientWidth - kid.offsetWidth) / 2,
      behavior: "smooth",
    });
  }

  return (
    <div className="operator-carousel">
      <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-white/45">
        Choose operator · scroll sideways
      </p>
      <div
        ref={scrollerRef}
        className="operator-track flex overflow-x-auto py-3 snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          gap: GAP,
          paddingLeft: edgePad,
          paddingRight: edgePad,
        }}
      >
        {OPERATORS.map((op) => {
          const selected = op.id === active;
          return (
            <button
              key={op.id}
              type="button"
              data-op-id={op.id}
              onClick={() => selectId(op.id)}
              className="operator-card relative shrink-0 snap-center overflow-hidden border transition-all duration-300"
              style={{
                width: CARD_W,
                height: 148,
                borderRadius: 10,
                borderColor: selected ? "#ffcf00" : "rgba(255,255,255,0.12)",
                opacity: selected ? 1 : 0.35,
                transform: selected ? "scale(1.08)" : "scale(0.92)",
                filter: selected ? "none" : "grayscale(0.55) brightness(0.7)",
                boxShadow: selected ? "0 0 18px rgba(255,207,0,0.35)" : "none",
                background: "#0d0d0d",
              }}
              aria-pressed={selected}
              aria-label={op.name}
            >
              <Image
                src={op.src}
                alt={op.name}
                fill
                quality={90}
                className="object-cover object-top"
                sizes="112px"
              />
              <span
                className="absolute inset-x-0 bottom-0 px-1 py-1 text-center text-[10px] font-semibold tracking-wide"
                style={{
                  background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
                  color: selected ? "#ffcf00" : "rgba(255,255,255,0.75)",
                }}
              >
                {op.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

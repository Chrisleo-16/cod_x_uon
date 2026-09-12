"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { OPERATORS, type OperatorCharacter } from "@/lib/characters";
import { celebrateSelect } from "@/lib/sfx";

type Props = {
  value: string;
  onChange: (id: string) => void;
};

function useCardSize() {
  const [size, setSize] = useState({ w: 128, h: 168, gap: 14 });
  useLayoutEffect(() => {
    const update = () => {
      const mobile = window.matchMedia("(max-width: 639px)").matches;
      // Mobile: larger, fuller portrait. Desktop form column: still readable + centerable.
      setSize(
        mobile
          ? { w: 148, h: 196, gap: 16 }
          : { w: 124, h: 164, gap: 14 },
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

export function OperatorCarousel({ value, onChange }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const lastId = useRef(value);
  const [active, setActive] = useState(value || OPERATORS[0].id);
  const [edgePad, setEdgePad] = useState(80);
  const { w: CARD_W, h: CARD_H, gap: GAP } = useCardSize();

  const measurePad = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // Side padding so first/last can sit fully centered in the viewport
    setEdgePad(Math.max(16, Math.round((el.clientWidth - CARD_W) / 2)));
  }, [CARD_W]);

  useLayoutEffect(() => {
    measurePad();
    const el = scrollerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measurePad);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measurePad]);

  const centerOf = (el: HTMLElement, kid: HTMLElement) => {
    const er = el.getBoundingClientRect();
    const kr = kid.getBoundingClientRect();
    return el.scrollLeft + (kr.left - er.left) + kr.width / 2;
  };

  const syncFromScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best: OperatorCharacter = OPERATORS[0];
    let bestDist = Infinity;
    const kids = Array.from(el.querySelectorAll<HTMLElement>("[data-op-id]"));
    for (const kid of kids) {
      const dist = Math.abs(centerOf(el, kid) - mid);
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

  const scrollToId = useCallback(
    (id: string, behavior: ScrollBehavior = "smooth") => {
      const el = scrollerRef.current;
      if (!el) return;
      const kid = el.querySelector<HTMLElement>(`[data-op-id="${id}"]`);
      if (!kid) return;
      const er = el.getBoundingClientRect();
      const kr = kid.getBoundingClientRect();
      const kidCenter = el.scrollLeft + (kr.left - er.left) + kr.width / 2;
      const target = kidCenter - el.clientWidth / 2;
      el.scrollTo({ left: Math.max(0, target), behavior });
    },
    [],
  );

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
    return () => el.removeEventListener("scroll", onScroll);
  }, [syncFromScroll]);

  // Center active card when layout/padding is ready (not on every parent value echo)
  useEffect(() => {
    const id = value || OPERATORS[0].id;
    const t = window.setTimeout(() => {
      scrollToId(id, "auto");
      syncFromScroll();
    }, 50);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-center on layout size changes
  }, [edgePad, CARD_W, scrollToId, syncFromScroll]);

  return (
    <div className="operator-carousel relative z-10">
      <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-white/45">
        Choose operator · scroll sideways
      </p>
      <div
        ref={scrollerRef}
        className="operator-track flex overflow-x-auto overflow-y-visible snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          gap: GAP,
          // Extra vertical room so the center card + glow aren’t clipped
          paddingTop: 18,
          paddingBottom: 18,
          paddingLeft: edgePad,
          paddingRight: edgePad,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {OPERATORS.map((op) => {
          const selected = op.id === active;
          return (
            <button
              key={op.id}
              type="button"
              data-op-id={op.id}
              onClick={() => scrollToId(op.id, "smooth")}
              className="operator-card relative shrink-0 snap-center overflow-hidden border transition-[transform,opacity,filter,box-shadow,border-color] duration-300 ease-out"
              style={{
                width: CARD_W,
                height: CARD_H,
                borderRadius: 10,
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? "#ffcf00" : "rgba(255,255,255,0.14)",
                opacity: selected ? 1 : 0.4,
                transform: selected ? "scale(1.06)" : "scale(0.88)",
                filter: selected ? "none" : "grayscale(0.5) brightness(0.65)",
                boxShadow: selected
                  ? "0 0 0 1px rgba(255,207,0,0.35), 0 0 24px rgba(255,207,0,0.45)"
                  : "none",
                background: "#0d0d0d",
                zIndex: selected ? 2 : 1,
              }}
              aria-pressed={selected}
              aria-label={op.name}
            >
              <Image
                src={op.src}
                alt={op.name}
                fill
                quality={95}
                className="object-cover object-[center_15%]"
                sizes="(max-width: 639px) 158px, 134px"
                priority={selected}
              />
              <span
                className="absolute inset-x-0 bottom-0 px-1.5 py-1.5 text-center text-[10px] font-semibold tracking-wide sm:text-[11px]"
                style={{
                  background: "linear-gradient(transparent, rgba(0,0,0,0.9))",
                  color: selected ? "#ffcf00" : "rgba(255,255,255,0.75)",
                  fontFamily: "var(--font-display), var(--font-body), sans-serif",
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

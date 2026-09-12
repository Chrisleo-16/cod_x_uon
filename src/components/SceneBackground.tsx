"use client";

import Image from "next/image";

export function DesktopArtPanel() {
  return (
    <aside className="relative hidden h-screen overflow-hidden md:block">
      <div className="absolute inset-3 overflow-hidden" style={{ borderRadius: 10 }}>
        <div className="relative h-full w-full">
          <Image
            src="/backgrounds/cod-desktop-left.png"
            alt="Call of Duty Mobile"
            fill
            priority
            className="object-cover object-center"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/20" />

          <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
            <Image
              src="/logos/cod-mobile-logo.png"
              alt="Call of Duty Mobile"
              width={501}
              height={189}
              className="h-10 w-auto object-contain lg:h-12"
              style={{ borderRadius: 10 }}
              priority
            />
            <span
              className="text-lg font-bold lowercase"
              style={{ fontFamily: "var(--font-display)", color: "#ffcf00" }}
              aria-hidden="true"
            >
              x
            </span>
            <Image
              src="/logos/uon-only.png"
              alt="University of Nairobi"
              width={378}
              height={370}
              className="h-11 w-auto object-contain lg:h-12"
              style={{ borderRadius: 10 }}
              priority
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

export function SceneBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden md:hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/backgrounds/squad-mobile.png)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/85" />
    </div>
  );
}

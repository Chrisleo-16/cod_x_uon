export type OperatorCharacter = {
  id: string;
  name: string;
  src: string;
  accent?: "portrait" | "full";
};

/** Fixed posters — side / loader / success only (not selectable operators) */
export const POSTERS = {
  side: "/backgrounds/side-eternal-ghost-duo.png",
  loaderDesktop: "/backgrounds/cod-loader-desktop.png",
  loaderMobile: "/backgrounds/squad-mobile.png",
  success: "/backgrounds/ghost-desktop.png",
} as const;

/** Selectable operators for squad registration */
export const OPERATORS: OperatorCharacter[] = [
  { id: "ghost-mist", name: "Ghost", src: "/characters/ghost-mist.png", accent: "full" },
  { id: "ghost-sas", name: "Ghost SAS", src: "/characters/ghost-sas.png", accent: "full" },
  { id: "ghost-close", name: "Ghost Mask", src: "/characters/ghost-close.png", accent: "portrait" },
  { id: "ops-3", name: "Skull Hood", src: "/characters/ops-3.png", accent: "portrait" },
  { id: "ops-6", name: "Outlaw", src: "/characters/ops-6.png", accent: "portrait" },
  { id: "ops-8", name: "Ghost Hood", src: "/characters/ops-8.png", accent: "portrait" },
  { id: "ops-1", name: "Cyber Visor", src: "/characters/ops-1.png", accent: "portrait" },
  { id: "fem-3", name: "Laurels", src: "/characters/fem-3.png", accent: "portrait" },
  { id: "fem-6", name: "Nightshade", src: "/characters/fem-6.png", accent: "portrait" },
  { id: "operator-female", name: "Field Agent", src: "/characters/operator-female.png", accent: "full" },
  { id: "fem-4", name: "Solar Knight", src: "/characters/fem-4.png", accent: "portrait" },
  { id: "ops-4", name: "Recon Cap", src: "/characters/ops-4.png", accent: "portrait" },
];

"use client";

type Props = {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
};

export function AttentionModal({
  open,
  title = "Attention",
  message,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-[2px]">
      <div className="relative w-full max-w-xl border-y border-white/40 bg-zinc-900">
        <div className="attention-stripes pointer-events-none absolute inset-0" />
        <div className="relative px-5 py-4">
          <div className="mb-6 flex items-start justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-2xl italic font-bold tracking-wide text-white">
              {title}
            </h2>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center bg-neutral-300 text-lg font-bold text-black"
            >
              X
            </button>
          </div>
          <p className="mx-auto mb-8 max-w-md text-center text-sm leading-relaxed text-white/95">
            {message}
          </p>
          <div className="flex justify-center pb-2">
            <button
              type="button"
              onClick={onClose}
              className="min-w-40 bg-cod-yellow px-10 py-2.5 font-[family-name:var(--font-display)] text-lg font-black tracking-wider text-black"
              style={{ backgroundColor: "#ffcf00" }}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

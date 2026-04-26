export function Filete({ width = 240 }: { width?: number }) {
  return (
    <div
      className="mx-auto flex items-center justify-center gap-3"
      style={{ maxWidth: width }}
      aria-hidden="true"
    >
      <span className="h-px flex-1 bg-champagne" />
      <Fleuron />
      <span className="h-px flex-1 bg-champagne" />
    </div>
  );
}

export function Fleuron({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      aria-hidden="true"
      className="text-champagne-deep"
    >
      <path
        d="M7 1.2 C 8.6 3.2, 9.4 4.2, 11 5.2 C 9.4 6.2, 8.6 7.2, 7 9.2 C 5.4 7.2, 4.6 6.2, 3 5.2 C 4.6 4.2, 5.4 3.2, 7 1.2 Z"
        fill="currentColor"
        opacity="0.85"
      />
      <circle cx="7" cy="11" r="0.9" fill="currentColor" />
      <path d="M5 12.4 L 7 11 L 9 12.4" stroke="currentColor" strokeWidth="0.4" fill="none" />
    </svg>
  );
}

export function FleuronTriplo() {
  return (
    <div className="flex items-center justify-center gap-3 text-champagne-deep" aria-hidden="true">
      <span className="text-[14px] opacity-60">◆</span>
      <span className="text-[14px] opacity-60">◆</span>
      <span className="text-[14px] opacity-60">◆</span>
    </div>
  );
}

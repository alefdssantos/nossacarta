type Props = {
  trackId: string;
  trackName: string;
  artistas: string;
};

export function TrilhaSonora({ trackId, trackName, artistas }: Props) {
  return (
    <section className="px-6 py-32 md:px-12">
      <div className="mx-auto grid max-w-[760px] grid-cols-1 gap-10 md:grid-cols-12">
        <div className="md:col-span-7">
          <VinylSleeve trackName={trackName} artistas={artistas} />
        </div>
        <div className="md:col-span-5 flex flex-col justify-center">
          <p className="font-sans text-[9px] uppercase tracking-[0.4em] text-champagne-deep">
            Trilha · V
          </p>
          <p className="mt-3 font-serif italic text-[24px] text-cocoa" style={{ lineHeight: 1.2 }}>
            {trackName}
          </p>
          <p className="mt-1 font-serif text-[16px] text-mauve">{artistas}</p>

          <div className="mt-6 overflow-hidden rounded-sm border border-cocoa/10">
            <iframe
              title={`${trackName} — ${artistas}`}
              src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
              width="100%"
              height="80"
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              className="block w-full border-0"
            />
          </div>
          <p className="mt-3 font-serif italic text-[12px] text-mauve">toque a faixa ao ler</p>
        </div>
      </div>
    </section>
  );
}

function VinylSleeve({ trackName, artistas }: { trackName: string; artistas: string }) {
  return (
    <div className="relative aspect-square w-full">
      <svg viewBox="0 0 320 320" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <rect x="2" y="2" width="316" height="316" fill="var(--color-paper)" stroke="var(--color-cocoa)" strokeOpacity="0.18" strokeWidth="1" />
        <rect x="6" y="6" width="308" height="308" fill="none" stroke="var(--color-cocoa)" strokeOpacity="0.06" strokeWidth="0.6" />
        <g style={{ transformOrigin: "160px 160px", animation: "vinyl-spin 24s linear infinite" }}>
          <circle cx="160" cy="160" r="112" fill="var(--color-cocoa)" />
          <circle cx="160" cy="160" r="108" fill="none" stroke="var(--color-cocoa-soft)" strokeOpacity="0.18" strokeWidth="0.4" />
          <circle cx="160" cy="160" r="96" fill="none" stroke="var(--color-cocoa-soft)" strokeOpacity="0.18" strokeWidth="0.4" />
          <circle cx="160" cy="160" r="80" fill="none" stroke="var(--color-cocoa-soft)" strokeOpacity="0.18" strokeWidth="0.4" />
          <circle cx="160" cy="160" r="64" fill="none" stroke="var(--color-cocoa-soft)" strokeOpacity="0.18" strokeWidth="0.4" />
          <circle cx="160" cy="160" r="36" fill="var(--color-rose-mist)" />
          <circle cx="160" cy="160" r="3" fill="var(--color-cocoa)" />
        </g>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div
          className="flex h-[22%] w-[22%] flex-col items-center justify-center rounded-full text-center"
          style={{ transform: "translateY(0%)" }}
        >
          <span className="font-serif italic text-cocoa" style={{ fontSize: 11, lineHeight: 1.2, padding: "0 4px" }}>
            {truncar(trackName, 28)}
          </span>
          <span className="mt-0.5 font-sans uppercase text-mauve" style={{ fontSize: 7, letterSpacing: "0.28em" }}>
            {truncar(artistas, 18)}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes vinyl-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function truncar(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

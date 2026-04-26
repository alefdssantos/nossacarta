"use client";

import { useEffect, useRef, useState } from "react";

type Segment = string | { text: string; className?: string; lineBreakAfter?: boolean };

type WordRevealProps = {
  segments: Segment[];
  className?: string;
  wordDelay?: number;
  baseDelay?: number;
};

export function WordReveal({
  segments,
  className = "",
  wordDelay = 0.07,
  baseDelay = 0,
}: WordRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          obs.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  let wordIndex = 0;

  return (
    <span ref={ref} className={className}>
      {segments.map((seg, sIdx) => {
        const text = typeof seg === "string" ? seg : seg.text;
        const segClass = typeof seg === "string" ? "" : seg.className ?? "";
        const lb = typeof seg === "object" && seg.lineBreakAfter;
        const words = text.split(/\s+/).filter(Boolean);

        return (
          <span key={sIdx} className={segClass}>
            {words.map((w, i) => {
              const idx = wordIndex++;
              return (
                <span
                  key={`${sIdx}-${i}`}
                  className="inline-block overflow-hidden align-baseline"
                  style={{ marginRight: i === words.length - 1 ? 0 : "0.22em" }}
                >
                  <span
                    className="inline-block will-change-transform"
                    style={{
                      transform: shown ? "translateY(0)" : "translateY(115%)",
                      opacity: shown ? 1 : 0,
                      transition: `opacity 0.85s cubic-bezier(0.2, 0.7, 0.2, 1) ${baseDelay + idx * wordDelay}s, transform 0.85s cubic-bezier(0.2, 0.7, 0.2, 1) ${baseDelay + idx * wordDelay}s`,
                    }}
                  >
                    {w}
                  </span>
                </span>
              );
            })}
            {lb && <br />}
          </span>
        );
      })}
    </span>
  );
}

"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type Tag = "div" | "section" | "article" | "aside" | "li" | "figure" | "header" | "h2" | "h3" | "p";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: Tag;
  y?: number;
  once?: boolean;
};

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
  y = 22,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            if (once) obs.unobserve(el);
          } else if (!once) {
            setShown(false);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once]);

  const Component = Tag as ElementType;

  return (
    <Component
      ref={ref as never}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity 1.05s cubic-bezier(0.2, 0.7, 0.2, 1) ${delay}s, transform 1.05s cubic-bezier(0.2, 0.7, 0.2, 1) ${delay}s`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Component>
  );
}

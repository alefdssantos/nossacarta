"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string };

function paginaAtual(href: string, pathname: string) {
  if (href.startsWith("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNav({ links }: { links: Item[] }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Principal"
      className="hidden items-center gap-6 font-sans text-[12px] uppercase tracking-[0.18em] text-cocoa-soft lg:flex"
    >
      {links.map((l) => {
        const atual = paginaAtual(l.href, pathname);
        return (
          <a
            key={l.href}
            href={l.href}
            aria-current={atual ? "page" : undefined}
            className={`inline-flex min-h-11 items-center hover:text-ruby ${atual ? "text-ruby" : ""}`}
          >
            {l.label}
          </a>
        );
      })}
    </nav>
  );
}

export function MobileNav({ links, conta }: { links: Item[]; conta: Item }) {
  const [aberto, setAberto] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setAberto(false);
  }, [pathname]);

  useEffect(() => {
    if (!aberto) return;
    function fechar(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("keydown", fechar);
    return () => document.removeEventListener("keydown", fechar);
  }, [aberto]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-cocoa/15 bg-paper px-4 font-sans text-[12px] uppercase tracking-[0.18em] text-cocoa"
        aria-expanded={aberto}
        aria-controls="menu-mobile"
        onClick={() => setAberto((v) => !v)}
      >
        {aberto ? "Fechar" : "Menu"}
      </button>
      {aberto && (
        <nav
          id="menu-mobile"
          aria-label="Menu"
          className="absolute inset-x-0 top-full z-40 border-b border-cocoa/10 bg-paper px-6 py-2 shadow-[var(--shadow-engrave)]"
        >
          <ul className="flex flex-col">
            {[...links, conta].map((l) => {
              const atual = paginaAtual(l.href, pathname);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={atual ? "page" : undefined}
                    onClick={() => setAberto(false)}
                    className={`flex min-h-11 items-center font-sans text-[13px] uppercase tracking-[0.18em] ${atual ? "text-ruby" : "text-cocoa"}`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}

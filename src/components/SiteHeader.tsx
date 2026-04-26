import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Variant = "landing" | "internal";

const navAnchors = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#eternidades", label: "Eternidades" },
  { href: "#depoimentos", label: "Depoimentos" },
  { href: "#tarifa", label: "Tarifa" },
  { href: "#duvidas", label: "Dúvidas" },
  { href: "/exemplo", label: "Exemplo" },
];

const navInternal = [
  { href: "/", label: "Início" },
  { href: "/exemplo", label: "Exemplo" },
];

export async function SiteHeader({ variant = "internal" }: { variant?: Variant }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const links = variant === "landing" ? navAnchors : navInternal;

  return (
    <header className="sticky top-0 z-40 border-b border-cocoa/10 bg-rose-mist/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4 md:px-12 md:py-5">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-script text-3xl text-ruby leading-none">Nossa</span>
          <span className="font-serif text-2xl italic font-medium text-cocoa leading-none tracking-tight">
            Carta
          </span>
          <span className="ml-1 hidden h-px w-8 bg-champagne md:inline-block" />
        </Link>

        <nav className="hidden items-center gap-6 font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa-soft lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-ruby">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/conta"
                className="hidden font-sans text-[11px] uppercase tracking-[0.22em] text-cocoa-soft hover:text-ruby sm:inline"
              >
                Minha conta
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="rounded-full border border-cocoa/15 bg-paper px-4 py-2 font-sans text-[11px] uppercase tracking-[0.2em] text-cocoa shadow-[var(--shadow-engrave)] transition hover:border-ruby/40 hover:text-ruby"
                >
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden font-sans text-[11px] uppercase tracking-[0.22em] text-cocoa-soft hover:text-ruby sm:inline"
              >
                Entrar
              </Link>
              <Link
                href={variant === "landing" ? "#tarifa" : "/cadastro"}
                className="rounded-full border border-cocoa/15 bg-paper px-4 py-2 font-sans text-[11px] uppercase tracking-[0.2em] text-cocoa shadow-[var(--shadow-engrave)] transition hover:border-ruby/40 hover:text-ruby"
              >
                Começar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

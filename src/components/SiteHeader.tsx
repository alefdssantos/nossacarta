import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DesktopNav, MobileNav } from "@/components/MobileNav";

type Variant = "landing" | "internal";

const navAnchors = [
  { href: "#tarifa", label: "Planos" },
  { href: "/exemplo", label: "Exemplo" },
  { href: "#duvidas", label: "Dúvidas" },
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
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-6 py-3 md:px-12 md:py-5">
        <Link href="/" className="group flex min-h-11 min-w-0 items-center gap-2">
          <span className="font-script text-2xl leading-none text-ruby sm:text-3xl">Nossa</span>
          <span className="font-serif text-xl italic font-medium leading-none tracking-tight text-cocoa sm:text-2xl">
            Carta
          </span>
        </Link>

        <DesktopNav links={links} />

        <div className="flex items-center gap-2 sm:gap-3">
          <MobileNav
            links={links}
            conta={user ? { href: "/conta", label: "Minha conta" } : { href: "/login", label: "Entrar" }}
          />
          {user ? (
            <>
              <Link
                href="/conta"
                className="hidden font-sans text-[12px] uppercase tracking-[0.18em] text-cocoa-soft hover:text-ruby sm:inline-flex sm:min-h-11 sm:items-center"
              >
                Minha conta
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center rounded-full border border-cocoa/15 bg-paper px-4 font-sans text-[12px] uppercase tracking-[0.18em] text-cocoa shadow-[var(--shadow-engrave)] transition hover:border-ruby/40 hover:text-ruby"
                >
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden font-sans text-[12px] uppercase tracking-[0.18em] text-cocoa-soft hover:text-ruby sm:inline-flex sm:min-h-11 sm:items-center"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="inline-flex min-h-11 items-center rounded-full border border-cocoa/15 bg-paper px-4 font-sans text-[12px] uppercase tracking-[0.18em] text-cocoa shadow-[var(--shadow-engrave)] transition hover:border-ruby/40 hover:text-ruby"
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

import type { ReactNode } from "react";
import Link from "next/link";

type Variant = "landing" | "internal";

export function SiteFooter({ variant = "internal" }: { variant?: Variant }) {
  return (
    <footer className="relative border-t border-cocoa/15">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-6 py-14 md:grid-cols-12 md:px-12 md:py-20">
        <div className="md:col-span-5">
          <div className="flex items-baseline gap-2">
            <span className="font-script text-4xl text-ruby leading-none">Nossa</span>
            <span className="font-serif text-3xl italic font-medium text-cocoa">Carta</span>
          </div>
          <p className="mt-5 max-w-sm font-prose text-[15px] italic text-mauve">
            Pequena editora digital de cartas eternas, feita à mão no Brasil. Para os que
            ainda escrevem.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <span className="h-px w-12 bg-champagne" />
            <span className="font-script text-2xl text-ruby">com amor,</span>
            <span className="font-prose text-[14px] italic text-cocoa-soft">da redação</span>
          </div>
        </div>

        <FooterCol title="Editora">
          {variant === "landing" ? (
            <>
              <FooterLink href="#como-funciona">Capítulos</FooterLink>
              <FooterLink href="#tarifa">Tarifa</FooterLink>
            </>
          ) : (
            <>
              <FooterLink href="/#como-funciona">Capítulos</FooterLink>
              <FooterLink href="/#tarifa">Tarifa</FooterLink>
            </>
          )}
          <FooterLink href="/exemplo">Exemplo</FooterLink>
          <FooterLink href="/login">Entrar</FooterLink>
        </FooterCol>

        <FooterCol title="Casa">
          <FooterLink href="/termos">Termos</FooterLink>
          <FooterLink href="/privacidade">Privacidade</FooterLink>
          <FooterLink href="mailto:ola@nossacarta.love">Contato</FooterLink>
        </FooterCol>

        <FooterCol title="Endereço">
          <li className="font-prose text-[14px] italic text-cocoa-soft">nossacarta.love</li>
          <li className="font-prose text-[14px] italic text-mauve">ola@nossacarta.love</li>
          <li className="font-sans text-[10px] uppercase tracking-[0.3em] text-mauve">
            BRA · MMXXVI
          </li>
        </FooterCol>
      </div>

      <div className="border-t border-cocoa/10 py-6">
        <p className="mx-auto max-w-[1280px] px-6 text-center font-prose text-[12px] italic text-mauve md:px-12">
          © NossaCarta · um pequeno selo independente · todos os direitos reservados, todas as
          cartas guardadas.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="md:col-span-2 lg:col-span-2">
      <p className="font-sans text-[10px] uppercase tracking-[0.32em] text-champagne-deep">{title}</p>
      <ul className="mt-4 flex flex-col gap-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  const isExternal = href.startsWith("mailto:") || href.startsWith("http");
  if (isExternal) {
    return (
      <li>
        <a href={href} className="font-prose text-[14px] italic text-cocoa transition hover:text-ruby">
          {children}
        </a>
      </li>
    );
  }
  return (
    <li>
      <Link
        href={href}
        className="font-prose text-[14px] italic text-cocoa transition hover:text-ruby"
      >
        {children}
      </Link>
    </li>
  );
}

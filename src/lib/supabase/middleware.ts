import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

const PROTECTED_PREFIXES = ["/conta", "/criar", "/editar", "/pagamento", "/checkout"];
const AUTH_ONLY_PREFIXES = ["/login", "/cadastro"];

// Rotas raiz que NÃO são slugs de carta
const KNOWN_ROOT_ROUTES = new Set([
  "",
  "login",
  "cadastro",
  "conta",
  "criar",
  "editar",
  "pagamento",
  "checkout",
  "api",
  "qr",
]);

function pathStartsWithAny(path: string, prefixes: string[]) {
  return prefixes.some((p) => path === p || path.startsWith(`${p}/`));
}

// Detecta /[slug] e /[slug]/historia — requer auth
function isCartaRota(path: string): boolean {
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return false;
  const first = segments[0];
  if (KNOWN_ROOT_ROUTES.has(first)) return false;
  // aceita /slug ou /slug/historia
  if (segments.length === 1) return true;
  if (segments.length === 2 && segments[1] === "historia") return true;
  return false;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const path = request.nextUrl.pathname;

  if (!user && (pathStartsWithAny(path, PROTECTED_PREFIXES) || isCartaRota(path))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(path + request.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }

  if (user && pathStartsWithAny(path, AUTH_ONLY_PREFIXES)) {
    const url = request.nextUrl.clone();
    url.pathname = "/conta";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Propaga identidade do usuário como request headers para server components.
  // Necessário porque em Next.js 16 a sessão renovada pelo middleware não
  // chega confiável via cookies() nas pages — os headers são o canal seguro.
  const reqHeaders = new Headers(request.headers);
  // Remove qualquer header spoofado pelo cliente antes de sobrescrever
  reqHeaders.delete("x-user-id");
  reqHeaders.delete("x-user-email");
  if (user) {
    reqHeaders.set("x-user-id", user.id);
    reqHeaders.set("x-user-email", user.email ?? "");
  }
  const responseWithHeaders = NextResponse.next({ request: { headers: reqHeaders } });
  // Preserva os Set-Cookie da renovação de sessão do Supabase
  for (const cookie of response.headers.getSetCookie()) {
    responseWithHeaders.headers.append("set-cookie", cookie);
  }
  return responseWithHeaders;
}

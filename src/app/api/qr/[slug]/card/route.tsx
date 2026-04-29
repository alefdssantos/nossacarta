import { type NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { createAdminClient } from "@/lib/supabase/server";
import { conteudoCartaV1Schema } from "@/lib/cartas/schema";
import { publicEnv } from "@/lib/env";

export const runtime = "nodejs";

type Params = Promise<{ slug: string }>;

async function loadFont(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.arrayBuffer();
  } catch {
    return null;
  }
}

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { slug } = await params;
  if (!/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/.test(slug)) {
    return new Response("invalid slug", { status: 400 });
  }

  const admin = createAdminClient();
  const { data: carta } = await admin
    .from("cartas")
    .select("id, slug, acesso_token, conteudo")
    .eq("slug", slug)
    .eq("status", "publicada")
    .maybeSingle();

  if (!carta) return new Response("not found", { status: 404 });

  const cParse = conteudoCartaV1Schema.safeParse(carta.conteudo);
  const nomes = cParse.success ? cParse.data.nomes : null;
  const nome1 = nomes?.pessoa1 ?? "";
  const nome2 = nomes?.pessoa2 ?? "";
  const nomesLabel = nome1 && nome2 ? `${nome1} & ${nome2}` : slug;

  const url = `${publicEnv.NEXT_PUBLIC_APP_URL}/${slug}?t=${carta.acesso_token}`;
  const urlLabel = `nossacarta.love/${slug}`;

  const qrDataUrl = await QRCode.toDataURL(url, {
    margin: 2,
    color: { dark: "#2A1518", light: "#FAF1EA" },
    errorCorrectionLevel: "M",
    width: 400,
  });

  // Playfair Display Italic + Regular (TTF via Google Fonts static)
  const [playfairItalic, playfairRegular] = await Promise.all([
    loadFont(
      "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFiD-vYSZviVYUb_rj3ij__anPXDTzYgEM86xQ.woff2",
    ),
    loadFont(
      "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzCwZvRdNME.woff2",
    ),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fonts: any[] = [];
  if (playfairRegular) {
    fonts.push({ name: "Playfair", data: playfairRegular, weight: 400, style: "normal" });
  }
  if (playfairItalic) {
    fonts.push({ name: "Playfair", data: playfairItalic, weight: 400, style: "italic" });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: 600,
          height: 800,
          display: "flex",
          flexDirection: "column",
          background: "#FAF1EA",
          fontFamily: fonts.length ? "Playfair, serif" : "serif",
        }}
      >
        {/* Borda externa */}
        <div
          style={{
            position: "absolute",
            inset: 16,
            border: "1px solid #C9A84C",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 20,
            border: "1px solid rgba(201,168,76,0.35)",
            display: "flex",
          }}
        />

        {/* Header ruby */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 52,
            paddingBottom: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 38, color: "#B01228", fontStyle: "italic" }}>Nossa</span>
            <span style={{ fontSize: 30, color: "#2A1518", fontStyle: "italic" }}>Carta</span>
          </div>
          {/* Ornamento */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 10,
            }}
          >
            <div style={{ width: 60, height: 1, background: "#C9A84C" }} />
            <div style={{ width: 5, height: 5, background: "#B01228", borderRadius: 999 }} />
            <div style={{ width: 60, height: 1, background: "#C9A84C" }} />
          </div>
        </div>

        {/* Nomes */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingBottom: 32,
          }}
        >
          <span
            style={{
              fontSize: 26,
              color: "#2A1518",
              fontStyle: "italic",
              letterSpacing: "0.05em",
            }}
          >
            {nomesLabel}
          </span>
        </div>

        {/* QR Code */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flex: 1,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              padding: 16,
              background: "#FAF1EA",
              border: "1px solid rgba(42,21,24,0.15)",
              boxShadow: "0 4px 24px rgba(42,21,24,0.08)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} width={240} height={240} alt="QR" />
          </div>
        </div>

        {/* Rodapé */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingBottom: 52,
            gap: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <div style={{ width: 60, height: 1, background: "#C9A84C" }} />
            <div style={{ width: 5, height: 5, background: "#B01228", borderRadius: 999 }} />
            <div style={{ width: 60, height: 1, background: "#C9A84C" }} />
          </div>
          <span
            style={{
              fontSize: 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#8C6A30",
              fontStyle: "normal",
            }}
          >
            escaneie para ler
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              color: "#7C0E1D",
              letterSpacing: "0.04em",
            }}
          >
            {urlLabel}
          </span>
        </div>

        {/* Cantos decorativos */}
        <CornerMark style={{ top: 28, left: 28 }} />
        <CornerMark style={{ top: 28, right: 28, transform: "rotate(90deg)" }} />
        <CornerMark style={{ bottom: 28, right: 28, transform: "rotate(180deg)" }} />
        <CornerMark style={{ bottom: 28, left: 28, transform: "rotate(270deg)" }} />
      </div>
    ),
    {
      width: 600,
      height: 800,
      fonts: fonts.length ? fonts : undefined,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, immutable",
        "Content-Disposition": `attachment; filename="nossacarta-${slug}.png"`,
      },
    },
  );
}

function CornerMark({ style }: { style: Record<string, string | number> }) {
  return (
    <div
      style={{
        position: "absolute",
        width: 16,
        height: 16,
        display: "flex",
        ...style,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16">
        <path d="M2 14 L2 2 L14 2" fill="none" stroke="#C9A84C" strokeWidth="1" />
      </svg>
    </div>
  );
}

import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { conteudoCartaV1Schema } from "@/lib/cartas/schema";
import { dataEmRomanos } from "@/lib/cartas/algarismos-romanos";

export const alt = "NossaCarta — uma carta eterna";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const { slug } = await Promise.resolve(params);
  const supabase = await createClient();
  const { data: carta } = await supabase
    .from("cartas")
    .select("conteudo, data_inicio_relacionamento, plano")
    .eq("slug", slug)
    .maybeSingle();

  const parsed = carta?.conteudo ? conteudoCartaV1Schema.safeParse(carta.conteudo) : null;
  const nomes = parsed?.success ? parsed.data.nomes : null;
  const pessoa1 = nomes?.pessoa1 ?? "Para você";
  const pessoa2 = nomes?.pessoa2 ?? "uma carta eterna";
  const dataRom = carta?.data_inicio_relacionamento
    ? dataEmRomanos(carta.data_inicio_relacionamento)
    : "MMXXVI";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FBEFE8",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
          padding: "60px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 24,
            border: "1px solid rgba(42,21,24,0.18)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 32,
            border: "1px solid rgba(42,21,24,0.06)",
          }}
        />

        <div
          style={{
            display: "flex",
            fontFamily: "Georgia, serif",
            fontSize: 18,
            letterSpacing: 12,
            color: "#8C6A30",
            textTransform: "uppercase",
            marginBottom: 32,
          }}
        >
          NossaCarta · Volume único
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: 28,
            color: "#7C0E1D",
          }}
        >
          <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 92, lineHeight: 1 }}>
            {pessoa1}
          </span>
          <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 64, color: "#C49A55" }}>
            &amp;
          </span>
          <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 92, lineHeight: 1, color: "#2A1518" }}>
            {pessoa2}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "Georgia, serif",
            fontSize: 22,
            letterSpacing: 6,
            color: "#4A2D31",
            marginTop: 36,
          }}
        >
          {dataRom}
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontSize: 22,
            color: "#8B6A6F",
            marginTop: 18,
          }}
        >
          uma carta eterna em uma só página
        </div>
      </div>
    ),
    { ...size },
  );
}

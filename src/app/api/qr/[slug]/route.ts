import { type NextRequest } from "next/server";
import QRCode from "qrcode";
import { publicEnv } from "@/lib/env";
import { linkCartaComToken } from "@/lib/cartas/link-publico";
import { CACHE_QR, cartaParaQr } from "@/lib/cartas/qr-acesso";

export const runtime = "nodejs";

type Params = Promise<{ slug: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { slug } = await params;
  const acesso = await cartaParaQr(request, slug);
  if (!acesso.ok) return acesso.response;

  const url = linkCartaComToken(publicEnv.NEXT_PUBLIC_APP_URL, slug, acesso.carta.acessoToken);
  const png = await QRCode.toBuffer(url, {
    margin: 1,
    color: { dark: "#2A1518", light: "#FAF1EA" },
    errorCorrectionLevel: "M",
    width: 320,
  });
  return new Response(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": CACHE_QR,
    },
  });
}

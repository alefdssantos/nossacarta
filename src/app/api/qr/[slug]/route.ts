import { type NextRequest } from "next/server";
import QRCode from "qrcode";
import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Params = Promise<{ slug: string }>;

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { slug } = await params;
  if (!/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/.test(slug)) {
    return new Response("invalid slug", { status: 400 });
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("cartas")
    .select("id")
    .eq("slug", slug)
    .eq("status", "publicada")
    .maybeSingle();
  if (!data) return new Response("not found", { status: 404 });
  const url = `${publicEnv.NEXT_PUBLIC_APP_URL}/${slug}`;
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
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}

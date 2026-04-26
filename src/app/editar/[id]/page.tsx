import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ id: string }>;

export default async function EditarPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect(`/login?next=/editar/${id}`);

  const { data: carta } = await supabase
    .from("cartas")
    .select("id, status, owner_id")
    .eq("id", id)
    .maybeSingle();

  if (!carta || carta.owner_id !== userData.user.id) notFound();

  redirect(`/criar/${id}/nomes`);
}

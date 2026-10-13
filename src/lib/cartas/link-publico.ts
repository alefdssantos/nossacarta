export function linkCartaComToken(appUrl: string, slug: string, acessoToken: string): string {
  const base = appUrl.replace(/\/$/, "");
  return `${base}/${slug}?t=${acessoToken}`;
}

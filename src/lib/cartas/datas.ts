// Helpers pra parse e formatação consistente de datas no fuso brasileiro.
// Datas vindas de <input type="date"> são strings ISO YYYY-MM-DD interpretadas
// como UTC por default; em -03:00 isso vira o dia anterior. Padronizamos parse local BR.

const FUSO_BR = "-03:00";

export function parseDataLocalBR(iso: string): Date {
  return new Date(`${iso}T12:00:00${FUSO_BR}`);
}

const dataLongoBR = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

const dataCurtoBR = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

export function formatarDataLongoBR(iso: string): string {
  return dataLongoBR.format(parseDataLocalBR(iso));
}

export function formatarDataCurtoBR(iso: string): string {
  return dataCurtoBR.format(parseDataLocalBR(iso));
}

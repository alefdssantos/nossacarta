// Conversor de número inteiro pra extenso pt-BR. Cobre até 999.999.999.

const UNIDADES = [
  "zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove",
  "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove",
];
const DEZENAS = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const CENTENAS = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

function ate999(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cem";
  const c = Math.floor(n / 100);
  const r = n % 100;
  const partes: string[] = [];
  if (c > 0) partes.push(CENTENAS[c]);
  if (r < 20) {
    if (r > 0) partes.push(UNIDADES[r]);
  } else {
    const d = Math.floor(r / 10);
    const u = r % 10;
    if (u === 0) partes.push(DEZENAS[d]);
    else partes.push(`${DEZENAS[d]} e ${UNIDADES[u]}`);
  }
  return partes.join(" e ");
}

export function porExtenso(n: number): string {
  if (n < 0) return `menos ${porExtenso(-n)}`;
  if (n === 0) return "zero";

  const milhoes = Math.floor(n / 1_000_000);
  const milhares = Math.floor((n % 1_000_000) / 1000);
  const resto = n % 1000;
  const partes: string[] = [];

  if (milhoes > 0) {
    partes.push(milhoes === 1 ? "um milhão" : `${ate999(milhoes)} milhões`);
  }
  if (milhares > 0) {
    partes.push(milhares === 1 ? "mil" : `${ate999(milhares)} mil`);
  }
  if (resto > 0) {
    if (partes.length > 0 && resto < 100) partes.push(`e ${ate999(resto)}`);
    else partes.push(ate999(resto));
  }

  return partes.join(" ");
}

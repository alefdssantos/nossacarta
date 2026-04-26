const TABELA: Array<[number, string]> = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
  [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

export function paraRomanos(n: number): string {
  if (n <= 0 || n >= 4000) return "";
  let resultado = "";
  let resto = Math.floor(n);
  for (const [valor, simb] of TABELA) {
    while (resto >= valor) {
      resultado += simb;
      resto -= valor;
    }
  }
  return resultado;
}

export function dataEmRomanos(iso: string): string {
  const d = new Date(`${iso}T00:00:00-03:00`);
  return `${paraRomanos(d.getFullYear())} · ${paraRomanos(d.getMonth() + 1)} · ${paraRomanos(d.getDate())}`;
}

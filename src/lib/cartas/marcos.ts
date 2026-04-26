// Cálculos de marcos do relacionamento (puro, sem deps).

const MS_DIA = 1000 * 60 * 60 * 24;
const PERIODO_LUNAR_DIAS = 29.530588853;
const BPM_MEDIO = 70;

export type Marcos = {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
  luas: number;
  natais: number;
  diasDosNamorados: number;
  batidas: number;
};

export function calcularMarcos(dataInicio: string | Date, agora: Date = new Date()): Marcos {
  const inicio =
    typeof dataInicio === "string"
      ? new Date(`${dataInicio}T00:00:00-03:00`)
      : dataInicio;

  const diffMs = Math.max(0, agora.getTime() - inicio.getTime());
  const dias = Math.floor(diffMs / MS_DIA);
  const horas = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutos = Math.floor((diffMs / (1000 * 60)) % 60);
  const segundos = Math.floor((diffMs / 1000) % 60);

  const luas = Math.floor(dias / PERIODO_LUNAR_DIAS);
  const natais = contarOcorrenciasAnuais(inicio, agora, 11, 25);
  const diasDosNamorados = contarOcorrenciasAnuais(inicio, agora, 5, 12);
  const batidas = Math.floor((diffMs / 60000) * BPM_MEDIO);

  return { dias, horas, minutos, segundos, luas, natais, diasDosNamorados, batidas };
}

// month: 0-11. Conta quantas vezes a data (mes/dia) ocorreu entre inicio e agora.
function contarOcorrenciasAnuais(inicio: Date, agora: Date, mes: number, dia: number): number {
  let count = 0;
  for (let ano = inicio.getFullYear(); ano <= agora.getFullYear(); ano++) {
    const ocorrencia = new Date(ano, mes, dia);
    if (ocorrencia >= inicio && ocorrencia <= agora) count++;
  }
  return count;
}

export function formatarBR(n: number): string {
  return new Intl.NumberFormat("pt-BR").format(n);
}

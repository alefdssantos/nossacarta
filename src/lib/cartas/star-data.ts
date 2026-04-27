// Mapa estelar editorial — não é astronomia precisa, é símbolo.
// Dataset compacto pro hemisfério sul brasileiro: Cruzeiro como âncora + algumas constelações reconhecíveis.
// Coordenadas em projeção estilizada (x,y em [-1, 1]), não estereográfica real.

export type Estrela = { x: number; y: number; mag: number; nome?: string };
export type Constelacao = { nome: string; estrelas: Estrela[]; linhas: Array<[number, number]> };

// Cruzeiro do Sul (centro). Posições normalizadas em torno do (0, 0).
const cruzeiro: Constelacao = {
  nome: "Cruzeiro do Sul",
  estrelas: [
    { x: 0, y: -0.18, mag: 1.3, nome: "Acrux" },
    { x: 0, y: 0.18, mag: 1.6, nome: "Gacrux" },
    { x: -0.16, y: 0, mag: 1.6, nome: "Mimosa" },
    { x: 0.14, y: 0.02, mag: 2.7, nome: "Delta" },
    { x: -0.05, y: 0.06, mag: 3.6 },
  ],
  linhas: [
    [0, 1],
    [2, 3],
  ],
};

// Centaurus parcial (Alpha + Beta apontando o Cruzeiro). Lateral esquerda.
const centaurus: Constelacao = {
  nome: "Centaurus",
  estrelas: [
    { x: -0.55, y: 0.15, mag: 0.0, nome: "Rigil Kent" },
    { x: -0.42, y: 0.08, mag: 0.6, nome: "Hadar" },
    { x: -0.35, y: -0.22, mag: 2.3 },
    { x: -0.62, y: -0.05, mag: 2.6 },
  ],
  linhas: [
    [0, 1],
    [1, 2],
    [0, 3],
  ],
};

// Escorpião — caudal arco. Direita-superior.
const escorpiao: Constelacao = {
  nome: "Escorpião",
  estrelas: [
    { x: 0.45, y: -0.25, mag: 1.1, nome: "Antares" },
    { x: 0.55, y: -0.32, mag: 2.6 },
    { x: 0.62, y: -0.18, mag: 2.9 },
    { x: 0.7, y: -0.05, mag: 1.6 },
    { x: 0.78, y: 0.08, mag: 2.4 },
    { x: 0.82, y: 0.18, mag: 1.9 },
    { x: 0.74, y: 0.25, mag: 2.0 },
    { x: 0.66, y: 0.32, mag: 2.7 },
  ],
  linhas: [
    [0, 1],
    [0, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
  ],
};

// Orion — três marias + Betelgeuse + Rigel. Inferior direita.
const orion: Constelacao = {
  nome: "Órion",
  estrelas: [
    { x: 0.18, y: 0.55, mag: 0.5, nome: "Betelgeuse" },
    { x: 0.32, y: 0.7, mag: 0.1, nome: "Rigel" },
    { x: 0.22, y: 0.62, mag: 1.6 },
    { x: 0.26, y: 0.64, mag: 1.7 },
    { x: 0.3, y: 0.66, mag: 2.0 },
    { x: 0.15, y: 0.7, mag: 2.0 },
    { x: 0.34, y: 0.55, mag: 1.7 },
  ],
  linhas: [
    [0, 2],
    [2, 3],
    [3, 4],
    [4, 1],
    [0, 6],
    [1, 5],
  ],
};

// Canis Major — Sirius + cauda. Inferior esquerda.
const canisMajor: Constelacao = {
  nome: "Canis Major",
  estrelas: [
    { x: -0.3, y: 0.55, mag: -1.5, nome: "Sirius" },
    { x: -0.45, y: 0.62, mag: 1.5 },
    { x: -0.38, y: 0.7, mag: 2.0 },
    { x: -0.22, y: 0.65, mag: 2.4 },
  ],
  linhas: [
    [0, 1],
    [1, 2],
    [0, 3],
  ],
};

// Estrelas dispersas (sky background) — ~50 pontos pseudo-fixos.
const estrelasFundo: Estrela[] = [
  { x: -0.85, y: -0.35, mag: 4 }, { x: -0.7, y: 0.45, mag: 3 }, { x: -0.62, y: 0.6, mag: 4 },
  { x: -0.5, y: -0.55, mag: 3.5 }, { x: -0.4, y: -0.7, mag: 4 }, { x: -0.78, y: 0.18, mag: 3.5 },
  { x: -0.25, y: 0.85, mag: 3 }, { x: 0.05, y: -0.85, mag: 4 }, { x: 0.15, y: -0.7, mag: 3.5 },
  { x: 0.32, y: 0.86, mag: 4 }, { x: 0.5, y: 0.7, mag: 3 }, { x: 0.68, y: 0.55, mag: 4 },
  { x: 0.85, y: 0.32, mag: 3.5 }, { x: 0.92, y: -0.1, mag: 4 }, { x: 0.78, y: -0.4, mag: 3 },
  { x: 0.35, y: -0.65, mag: 3.5 }, { x: -0.05, y: 0.4, mag: 4 }, { x: 0.08, y: -0.45, mag: 3.5 },
  { x: -0.18, y: -0.4, mag: 4 }, { x: -0.55, y: 0.35, mag: 3.5 }, { x: 0.42, y: 0.45, mag: 4 },
  { x: 0.12, y: 0.42, mag: 3.5 }, { x: -0.08, y: 0.78, mag: 4 }, { x: -0.32, y: 0.32, mag: 4 },
  { x: 0.55, y: -0.55, mag: 3.5 }, { x: -0.6, y: -0.18, mag: 4 }, { x: -0.22, y: -0.78, mag: 4 },
  { x: 0.6, y: -0.7, mag: 4 }, { x: -0.95, y: 0.05, mag: 3.5 }, { x: 0.95, y: 0.55, mag: 4 },
  { x: -0.42, y: 0.78, mag: 4 }, { x: 0.65, y: 0.85, mag: 4 }, { x: 0.05, y: 0.95, mag: 3 },
  { x: -0.88, y: -0.5, mag: 4 }, { x: 0.88, y: -0.6, mag: 4 }, { x: -0.12, y: -0.95, mag: 3.5 },
];

export const constelacoes: Constelacao[] = [cruzeiro, centaurus, escorpiao, orion, canisMajor];
export const fundo: Estrela[] = estrelasFundo;

// Rotação anual baseada em dia do ano [0..1]. Útil pra dar identidade temporal sutil
// sem comprometer a leitura das constelações.
export function rotacaoAnualRad(iso: string): number {
  const d = new Date(`${iso}T00:00:00-03:00`);
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  const dia = Math.floor(diff / (1000 * 60 * 60 * 24));
  // 0..2π proporcional ao dia do ano. Dividido por 4 pra rotacionar máximo 90°.
  return ((dia / 365) * Math.PI) / 2;
}

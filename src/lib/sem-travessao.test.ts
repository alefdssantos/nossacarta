import { expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const raiz = resolve(import.meta.dir, "../..");

const PONTOS = [0x2014, 0x2013, 0x2012, 0x2015, 0x2e3a, 0x2e3b];

function escapes(): string[] {
  const nomes = ["mdash", "ndash"];
  const decimais = ["8212", "8211"];
  const hex = ["2014", "2013", "2015"];
  return [
    ...nomes.map((nome) => "&" + nome + ";"),
    ...decimais.map((n) => "&" + "#" + n + ";"),
    ...hex.map((n) => "&" + "#x" + n + ";"),
  ];
}

test("arquivos rastreados nao contem travessao", () => {
  const lista = execFileSync("git", ["ls-files", "-z"], { cwd: raiz });
  const arquivos = lista.toString("utf8").split("\0").filter(Boolean);
  const marcas = escapes();
  const ruins: string[] = [];

  for (const rel of arquivos) {
    if (rel === "bun.lock" || rel.startsWith("node_modules/") || rel.startsWith(".next/")) {
      continue;
    }
    const bytes = readFileSync(join(raiz, rel)).toString("latin1");
    for (const ponto of PONTOS) {
      const seq = Buffer.from(String.fromCodePoint(ponto), "utf8").toString("latin1");
      if (bytes.includes(seq)) {
        ruins.push(`${rel} U+${ponto.toString(16).toUpperCase()}`);
      }
    }
    const baixo = bytes.toLowerCase();
    for (const marca of marcas) {
      if (baixo.includes(marca)) ruins.push(`${rel} ${marca}`);
    }
  }

  expect(ruins).toEqual([]);
});

test("interface nao desenha risco horizontal", () => {
  const lista = execFileSync("git", ["ls-files", "-z"], { cwd: raiz });
  const arquivos = lista.toString("utf8").split("\0").filter(Boolean);
  const ruins: string[] = [];
  for (const rel of arquivos) {
    if (!rel.endsWith(".tsx") && !rel.endsWith(".svg")) continue;
    const texto = readFileSync(join(raiz, rel), "utf8");
    if (texto.includes("h-px")) ruins.push(rel);
  }
  expect(ruins).toEqual([]);
});

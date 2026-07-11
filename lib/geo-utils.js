import cidades from "./cidades-conesul.json";

// Remove acentos, baixa a caixa e tira espaços extras, pra comparar nomes
// digitados livremente contra o banco de cidades.
export function normalizar(texto) {
  return (texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

// Casos especiais: nomes compostos que devem ser tratados como outra cidade
// "por enquanto". Chave = nome normalizado como foi digitado, valor = nome
// normalizado da cidade que deve ser usada para localizar no mapa.
const EXCECOES = {
  "canoas/poa": "porto alegre",
  "canoas / poa": "porto alegre",
  "poa/canoas": "porto alegre",
  "poa / canoas": "porto alegre",
  "canoas-poa": "porto alegre",
  "santana do livramento": "sant'ana do livramento",
};

const INDICE = new Map(cidades.map((c) => [normalizar(c.nome), c]));

const UFS_VALIDAS = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]);

// Recebe o texto de cidade como a pessoa digitou no formulário e devolve
// { nome, uf, lat, lng } se conseguir associar a uma cidade conhecida,
// ou null se não encontrar (a cidade continua contabilizada, só não aparece
// como ponto no mapa).
export function localizarCidade(textoDigitado) {
  const norm = normalizar(textoDigitado);

  // Tenta o texto como veio (já cobre os casos especiais em EXCECOES)
  const direto = INDICE.get(EXCECOES[norm] || norm);
  if (direto) return direto;

  // Tenta removendo uma sigla de estado no final, tipo "Imbituba SC",
  // "Imbituba - SC", "Imbituba/SC" ou "Imbituba, SC"
  const match = norm.match(/^(.*?)[\s\-/,]+([a-z]{2})$/);
  if (match) {
    const [, base, sigla] = match;
    if (UFS_VALIDAS.has(sigla.toUpperCase())) {
      const semSigla = INDICE.get(EXCECOES[base] || base);
      if (semSigla) return semSigla;
    }
  }

  return null;
}

export const ESTADOS_CONESUL = ["RS", "SC", "PR", "MS", "MT"];

export const NOME_ESTADO = {
  RS: "Rio Grande do Sul",
  SC: "Santa Catarina",
  PR: "Paraná",
  MS: "Mato Grosso do Sul",
  MT: "Mato Grosso",
};

export default cidades;

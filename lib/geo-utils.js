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
};

const INDICE = new Map(cidades.map((c) => [normalizar(c.nome), c]));

// Recebe o texto de cidade como a pessoa digitou no formulário e devolve
// { nome, uf, lat, lng } se conseguir associar a uma cidade conhecida,
// ou null se não encontrar (a cidade continua contabilizada, só não aparece
// como ponto no mapa).
export function localizarCidade(textoDigitado) {
  const norm = normalizar(textoDigitado);
  const chave = EXCECOES[norm] || norm;
  return INDICE.get(chave) || null;
}

export const ESTADOS_CONESUL = ["RS", "SC", "PR", "MS"];

export const NOME_ESTADO = {
  RS: "Rio Grande do Sul",
  SC: "Santa Catarina",
  PR: "Paraná",
  MS: "Mato Grosso do Sul",
};

export default cidades;

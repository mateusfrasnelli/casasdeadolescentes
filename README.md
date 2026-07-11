# Casas de Adolescentes

Duas páginas:
- `/` — formulário público (link para o grupo)
- `/painel` — lista completa, sem login (link para o administrador)

Os dois lêem/escrevem na mesma coleção `casas` do Firestore, então sincronizam
em tempo real de verdade (sem precisar dar refresh).

**Sobre o acesso ao painel:** como não há login, não existe forma de o banco de
dados diferenciar "o administrador" de "qualquer pessoa que tenha o link".
A proteção aqui é só não divulgar o link de `/painel` — quem tiver o link,
consegue ver e remover itens. Se algum dia isso incomodar, dá pra adicionar
login depois sem redesenhar nada.

---

## 1. Criar o projeto no Firebase

1. Acesse https://console.firebase.google.com e crie um novo projeto.
2. No menu lateral, vá em **Build > Firestore Database** e clique em **Criar banco de dados**.
   Escolha o modo **produção** e a região mais próxima (ex: `southamerica-east1`).
3. Vá em **Configurações do projeto** (ícone de engrenagem) > aba **Geral** > role até
   **Seus apps** > clique no ícone `</>` para criar um "app da Web".
   Dê um nome qualquer e clique em registrar. Isso vai mostrar um objeto `firebaseConfig`
   com as chaves — você vai usar esses valores no passo 3 abaixo.
4. Em **Firestore Database > Regras**, apague o conteúdo e cole o arquivo `firestore.rules`
   deste projeto. Clique em **Publicar**.

## 2. Rodar localmente (opcional, para testar antes)

```bash
npm install
cp .env.local.example .env.local
# edite o .env.local com as chaves do passo 1.5
npm run dev
```

Abra `http://localhost:3000` (formulário) e `http://localhost:3000/painel` (painel).

## 3. Colocar no ar (Vercel)

1. Suba esta pasta para um repositório no GitHub (pode ser privado).
2. Acesse https://vercel.com, clique em **Add New > Project** e importe esse repositório.
3. Antes de clicar em Deploy, abra **Environment Variables** e adicione, uma por uma,
   as mesmas 6 variáveis do `.env.local.example`, com os valores do Firebase:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
4. Clique em **Deploy**. Em 1–2 minutos o Vercel te dá uma URL, tipo `casas-de-adolescentes.vercel.app`.

## 4. Links finais

- Link para o grupo (formulário): `https://SEU-PROJETO.vercel.app`
- Link para o administrador (painel): `https://SEU-PROJETO.vercel.app/painel`

Envie o primeiro link no grupo normalmente. Envie o segundo só para quem
deve enxergar a lista — não tem senha, então trate esse link como confidencial.

## Observações

- Qualquer pessoa com o link do formulário pode cadastrar uma casa, sem precisar
  de login, como um Google Forms.
- Qualquer pessoa com o link do painel pode ver a lista e remover itens.
  Não há distinção técnica de "administrador" — a única barreira é o link em si.
- Se quiser trocar o texto, cores ou adicionar campos novos (ex: nome do responsável),
  os arquivos são `app/page.js` (formulário) e `app/painel/page.js` (painel).

## Sobre o mapa do Conesul

O painel mostra um mapa com RS, SC, PR e MS, com um ponto para cada cidade que já
tem casa cadastrada.

- `lib/cidades-conesul.json` tem os **1.270 municípios oficiais** desses 4 estados
  (dados do IBGE: RS 497, PR 399, SC 295, MS 79), com coordenadas. Ou seja, qualquer
  cidade real desses estados é reconhecida automaticamente.
- `lib/geo-utils.js` faz a comparação entre o texto digitado no formulário e
  essa lista (ignorando acentos e maiúsculas/minúsculas), além de tratar o
  caso especial "Canoas/POA" → considerado Porto Alegre por enquanto. Outros
  casos assim podem ser adicionados no objeto `EXCECOES` desse arquivo.
- O mesmo arquivo `cidades-conesul.json` alimenta o autocomplete (`datalist`)
  do campo Cidade no formulário — a pessoa pode escolher uma sugestão ou
  continuar digitando livremente. Como agora são 1.270 opções, o navegador
  vai filtrar a lista conforme a pessoa digita (comportamento padrão do
  campo, não precisa fazer nada a mais).
- O contorno dos estados vem de um GeoJSON público, carregado pelo navegador
  de quem abre o painel (não fica salvo no projeto). Se o mapa aparecer cortado
  ou fora do centro, os valores `scale` e `center` para ajustar ficam no topo
  do arquivo `app/painel/MapaConesul.js`.
- Se algum dia um município mudar de nome ou for criado, é só editar
  `lib/cidades-conesul.json` diretamente (mesmo formato:
  `{"nome":"...","uf":"RS","lat":...,"lng":...}`).

# Rumo

Sistema financeiro local em **TypeScript**, com **interface web** (React + Vite) e **API REST** (Express), para cadastro de receitas, despesas, consulta de saldo, extrato e simulação de investimentos.

---

## 📋 Funcionalidades implementadas

| Tela / Rota | Funcionalidade |
|-------|----------------|
| **Dashboard** (`/`) | Visão geral com saldo, totais de renda/gasto e últimas transações |
| **Transações** (`/transacoes`) | Cadastrar rendas e gastos, consultar o histórico com busca e exclusão por ID |
| **Investimento** (`/investimento`) | Simular rendimento mensal com base na taxa Selic (1,4% a.m.) |
| **Barra superior** | Saldo atual sempre visível, atualizado em tempo real após cada transação |

### Detalhes das funcionalidades

- **Cadastro de renda e gasto**: aceita valor monetário (com ponto ou vírgula como separador decimal) e categoria. A categoria é normalizada (minúscula e sem acentos).
- **Persistência**: todos os dados são salvos automaticamente em `data.json` na raiz do projeto. Ao reiniciar, as informações são carregadas novamente.
- **IDs únicos**: cada transação recebe um ID sequencial, permitindo exclusão precisa por ID (em vez de índice frágil de array).
- **Validação de entrada**: valores devem ser números maiores que zero; categorias não podem ser vazias.
- **Simulação de investimento**: permite informar o valor e a quantidade de meses (máximo 120) para simular rendimento com taxa Selic fixa de 1,4% ao mês.
- **Formatação monetária**: valores exibidos com duas casas decimais (ex: `R$ 1.500,00`).
- **Tema claro/escuro**: alternância persistida em `localStorage`.
- **Responsivo**: layout adaptado para desktop e celular.

---

## 🔌 Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/transacoes` | Lista todas as transações |
| `POST` | `/api/transacoes` | Cadastra uma renda ou gasto — body: `{ tipo, valor, categoria }` |
| `DELETE` | `/api/transacoes/:id` | Exclui uma transação por ID |
| `GET` | `/api/pesquisar?categoria=xxx` | Pesquisa transações por categoria |
| `GET` | `/api/saldo` | Retorna `{ saldo, totalRenda, totalGasto }` |
| `POST` | `/api/investimento/simular` | Simula o rendimento — body: `{ valor, meses }` |

---

## 📁 Estrutura do projeto

```
saasfinanceiro/
├── .gitignore
├── package.json           # Dependências e scripts npm (backend)
├── package-lock.json      # Travamento de versões
├── tsconfig.json          # Configuração TypeScript (Node16, strict)
├── README.md              # Este arquivo
├── data.json              # Banco de dados local (gerado automaticamente, ignorado pelo Git)
├── data.example.json      # Exemplo do formato de dados
├── src/                   # Backend (Express + serviços)
│   ├── main.ts            # CLI legada (mantida para uso no terminal)
│   ├── server.ts          # Servidor HTTP + rotas da API + arquivos estáticos
│   └── services/
│       ├── investimento.ts
│       ├── persistencia.ts
│       └── transacoes.ts
├── frontend/              # Frontend (React + TypeScript + Vite)
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx        # Navbar + rotas
│       ├── api.ts         # Cliente HTTP da API
│       ├── components/    # Ícones, formatação, SaldoBadge, ThemeToggle
│       ├── context/       # Contextos de tema e saldo
│       ├── hooks/         # Providers e hooks (useSaldo, useTema)
│       ├── pages/         # Dashboard, Transacoes, Investimento
│       └── index.css
└── dist/                  # Build gerado (ignorado pelo Git)
    ├── server.js          # Backend compilado
    ├── public/            # Frontend compilado pelo Vite
    └── services/
```

---

## 🚀 Como executar

### Pré-requisitos
- [Node.js](https://nodejs.org/) instalado

### Instalação
```bash
npm install
cd frontend && npm install && cd ..
```

### Desenvolvimento (com recarga automática)
```bash
npm run dev          # backend em http://localhost:3000
cd frontend && npm run dev   # frontend em http://localhost:5173
```

### Build e execução compilada
```bash
npm run build      # compila o frontend (Vite) e o backend (tsc)
npm start          # sobe o servidor servindo a API e o frontend
```

> A porta pode ser alterada pela variável de ambiente `PORTA` (padrão: `3000`).

### Primeiro uso
O arquivo `data.json` é criado automaticamente na primeira execução. Para começar com um modelo, copie `data.example.json` para `data.json`.

---

## 🛠️ Tecnologias utilizadas

| Tecnologia | Uso |
|------------|-----|
| **React 19** | Interface web (SPA) |
| **TypeScript** | Linguagem principal (frontend e backend) |
| **Vite** | Bundler e servidor de desenvolvimento do frontend |
| **Express 5** | API REST e serviço dos arquivos estáticos |
| **React Router** | Navegação entre as telas |
| **Oxlint** | Lint do frontend |
| **Node.js** | Runtime |
| **fs** (nativo) | Leitura/gravação de `data.json` |
| **path** (nativo) | Manipulação de caminhos |

---

## ⚠️ Observações importantes

- Este é um projeto **local**, sem autenticação e sem banco de dados externo.
- Os dados ficam armazenados em `data.json` no disco. O arquivo é **ignorado pelo Git** — use `data.example.json` como referência do formato.
- O frontend é compilado para `dist/public` e servido pelo próprio Express, com fallback de rota para o `index.html` (SPA).
- Não há testes automatizados configurados.
- Não há deploy em nuvem configurado.

---

## 📄 Licença

ISC
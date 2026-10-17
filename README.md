# Saas Financeiro

Sistema financeiro simples de linha de comando (CLI) escrito em **TypeScript** para cadastro de receitas, despesas, consulta de saldo, extrato e simulação de investimentos.

---

## 📋 Funcionalidades implementadas

O programa roda no terminal via `readline` e oferece o seguinte menu:

| Opção | Funcionalidade |
|-------|----------------|
| 1 | Cadastrar renda |
| 2 | Cadastrar gasto |
| 3 | Mostrar saldo (total de renda, total de gasto e saldo atual) |
| 4 | Mostrar extrato (todas as transações com ID) |
| 5 | Pesquisar categoria no extrato |
| 6 | Deletar transação por ID |
| 7 | Simular investimento (rendimento mensal com taxa Selic) |
| 8 | Sair |

### Detalhes das funcionalidades

- **Cadastro de renda e gasto**: aceita valor monetário (com ponto ou vírgula como separador decimal) e categoria. A categoria é normalizada (minúscula e sem acentos).
- **Persistência**: todos os dados são salvos automaticamente em `data.json` na raiz do projeto. Ao reiniciar, as informações são carregadas novamente.
- **IDs únicos**: cada transação recebe um ID sequencial, permitindo exclusão precisa por ID (em vez de índice frágil de array).
- **Validação de entrada**: valores devem ser números maiores que zero; categorias não podem ser vazias.
- **Simulação de investimento**: permite informar o valor e a quantidade de meses (máximo 120) para simular rendimento com taxa Selic fixa de 1,4% ao mês.
- **Formatação monetária**: valores exibidos com duas casas decimais (ex: `R$ 1.500,00`).

---

## 📁 Estrutura do projeto

```
saasfinanceiro/
├── package.json          # Dependências e scripts npm
├── package-lock.json     # Travamento de versões
├── tsconfig.json         # Configuração TypeScript (Node16, strict)
├── README.md             # Este arquivo
├── data.json             # Banco de dados local (gerado automaticamente)
├── src/
│   └── main.ts           # Código-fonte principal (CLI)
├── public/               # Pasta vazia (reservada para futuro frontend)
└── dist/                 # Código compilado (gerado pelo `npm run build`)
    ├── main.js
    ├── main.d.ts
    ├── main.js.map
    └── main.d.ts.map
```

---

## 🚀 Como executar

### Pré-requisitos
- [Node.js](https://nodejs.org/) instalado

### Instalação
```bash
npm install
```

### Modo desenvolvimento (com `ts-node-dev`)
```bash
npm run dev
```

### Build e execução compilada
```bash
npm run build      # compila o TypeScript para dist/
npm start          # roda dist/main.js
```

---

## 🛠️ Tecnologias utilizadas

| Tecnologia | Uso |
|------------|-----|
| **TypeScript** | Linguagem principal |
| **Node.js** | Runtime |
| **readline** (nativo) | Interface de linha de comando |
| **fs** (nativo) | Leitura/gravação de `data.json` |
| **path** (nativo) | Manipulação de caminhos |

---

## ⚠️ Observações importantes

- Este é um **projeto CLI local**, sem interface web e sem autenticação.
- Os dados ficam armazenados em `data.json` no disco, não em banco de dados externo.
- Não há testes configurados (`npm test` retorna erro intencional).
- Não há deploy em nuvem configurado.

### 🔮 Próximos passos planejados

A intenção futura é transformar este projeto em um **site web**, evoluindo da CLI atual para uma interface web completa.

---

## 📄 Licença

ISC
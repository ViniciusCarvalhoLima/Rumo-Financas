import express from "express";
import cors from "cors";
import * as path from "path";

import {
  cadastrarRenda,
  cadastrarGasto,
  listarTransacoes,
  pesquisarCategoria,
  deletarTransacao,
  calcularSaldo,
  formatarCategoria,
} from "./services/transacoes";
import { simularInvestimento } from "./services/investimento";
import { carregarEstado } from "./services/persistencia";

const app = express();
const PORTA = Number(process.env.PORTA) || 3000;

app.use(cors());
app.use(express.json());

// Inicializa dados ao iniciar o servidor
carregarEstado();

// GET /api/transacoes — listar todas
app.get("/api/transacoes", (_req, res) => {
  try {
    const transacoes = listarTransacoes();
    res.json(transacoes);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao listar transações." });
  }
});

// POST /api/transacoes — cadastrar renda ou gasto
// Body: { tipo: "Renda" | "Gasto", valor: number, categoria: string }
app.post("/api/transacoes", (req, res) => {
  try {
    const { tipo, valor, categoria } = req.body;

    if (!tipo || !["Renda", "Gasto"].includes(tipo)) {
      return res.status(400).json({ erro: "Tipo deve ser 'Renda' ou 'Gasto'." });
    }

    const valorNumerico = Number(valor);
    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      return res.status(400).json({ erro: "Valor inválido." });
    }

    if (!categoria || typeof categoria !== "string" || categoria.trim().length === 0) {
      return res.status(400).json({ erro: "Categoria inválida." });
    }

    if (tipo === "Renda") {
      cadastrarRenda(valorNumerico, categoria);
    } else {
      cadastrarGasto(valorNumerico, categoria);
    }

    res.status(201).json({ mensagem: `${tipo} cadastrada com sucesso.` });
  } catch (erro) {
    res.status(400).json({ erro: (erro as Error).message });
  }
});

// DELETE /api/transacoes/:id — excluir por ID
app.delete("/api/transacoes/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ erro: "ID inválido." });
    }
    deletarTransacao(id);
    res.json({ mensagem: "Transação removida com sucesso." });
  } catch (erro) {
    res.status(400).json({ erro: (erro as Error).message });
  }
});

// GET /api/saldo — resumo financeiro
app.get("/api/saldo", (_req, res) => {
  try {
    const saldo = calcularSaldo();
    res.json(saldo);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao calcular saldo." });
  }
});

// POST /api/investimento/simular — simular investimento
// Body: { valor: number, meses: number }
app.post("/api/investimento/simular", (req, res) => {
  try {
    const { valor, meses } = req.body;
    const valorNumerico = Number(valor);
    const mesesNumerico = Number(meses);

    const resultado = simularInvestimento(valorNumerico, mesesNumerico);
    res.json(resultado);
  } catch (erro) {
    res.status(400).json({ erro: (erro as Error).message });
  }
});

// GET /api/pesquisar?categoria=xxx — pesquisar por categoria
app.get("/api/pesquisar", (req, res) => {
  try {
    const categoria = req.query.categoria as string;
    if (!categoria) {
      return res.status(400).json({ erro: "Informe o parâmetro categoria." });
    }
    const encontrados = pesquisarCategoria(categoria);
    res.json(encontrados);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao pesquisar categoria." });
  }
});

// Servir arquivos estáticos do React (build do Vite)
const caminhoPublic = path.join(__dirname, "..", "dist", "public");
app.use(express.static(caminhoPublic));

// Fallback SPA: qualquer rota não-API retorna o index.html do React
app.use((_req, res) => {
  res.sendFile(path.join(caminhoPublic, "index.html"));
});

app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});

export default app;
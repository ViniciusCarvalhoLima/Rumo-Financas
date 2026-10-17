import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import {
  listarTransacoes,
  cadastrarTransacao,
  removerTransacao,
  obterResumo,
  listarMetas,
  cadastrarMeta,
  adicionarAporteMeta,
  removerMeta,
  calcularSimulacao,
  reiniciarDadosExemplo,
} from "./servicoFinanceiro.js";

const app = express();
const porta = Number(process.env.PORT) || 3000;
const pastaPublica = path.resolve(process.cwd(), "public");

app.use(cors());
app.use(express.json());
app.use(express.static(pastaPublica));

app.get("/api/resumo", (_req: Request, res: Response) => {
  const resumo = obterResumo();
  res.json(resumo);
});

app.get("/api/transacoes", (req: Request, res: Response) => {
  const categoria = typeof req.query.categoria === "string" ? req.query.categoria : undefined;
  const tipo = typeof req.query.tipo === "string" ? req.query.tipo : undefined;
  const transacoes = listarTransacoes(categoria, tipo);
  res.json(transacoes);
});

app.post("/api/transacoes", (req: Request, res: Response) => {
  const { tipo, descricao, valor, categoria, data } = req.body;

  if (tipo !== "renda" && tipo !== "gasto") {
    res.status(400).json({ mensagem: "O tipo deve ser 'renda' ou 'gasto'." });
    return;
  }

  const valorNumerico = Number(valor);
  if (isNaN(valorNumerico) || valorNumerico <= 0) {
    res.status(400).json({ mensagem: "O valor informado precisa ser maior que zero." });
    return;
  }

  if (!categoria || typeof categoria !== "string") {
    res.status(400).json({ mensagem: "A categoria é obrigatória." });
    return;
  }

  const descricaoFinal = typeof descricao === "string" && descricao.trim() ? descricao : categoria;

  const novaTransacao = cadastrarTransacao({
    tipo,
    descricao: descricaoFinal,
    valor: valorNumerico,
    categoria,
    data: typeof data === "string" ? data : undefined,
  });

  res.status(201).json(novaTransacao);
});

function extrairId(parametro: string | string[] | undefined): string {
  if (Array.isArray(parametro)) {
    return parametro[0] || "";
  }
  return parametro || "";
}

app.delete("/api/transacoes/:id", (req: Request, res: Response) => {
  const id = extrairId(req.params.id);
  if (!id) {
    res.status(400).json({ mensagem: "Identificador não informado." });
    return;
  }

  const sucesso = removerTransacao(id);
  if (!sucesso) {
    res.status(404).json({ mensagem: "Transação não encontrada." });
    return;
  }

  res.json({ mensagem: "Transação removida com sucesso." });
});

app.get("/api/metas", (_req: Request, res: Response) => {
  const metas = listarMetas();
  res.json(metas);
});

app.post("/api/metas", (req: Request, res: Response) => {
  const { titulo, valorAlvo, valorAtual, dataLimite } = req.body;

  if (!titulo || typeof titulo !== "string" || !titulo.trim()) {
    res.status(400).json({ mensagem: "O título da meta é obrigatório." });
    return;
  }

  const alvoNumerico = Number(valorAlvo);
  if (isNaN(alvoNumerico) || alvoNumerico <= 0) {
    res.status(400).json({ mensagem: "O valor alvo deve ser maior que zero." });
    return;
  }

  const novaMeta = cadastrarMeta({
    titulo,
    valorAlvo: alvoNumerico,
    valorAtual: Number(valorAtual) || 0,
    dataLimite: typeof dataLimite === "string" ? dataLimite : undefined,
  });

  res.status(201).json(novaMeta);
});

app.post("/api/metas/:id/aporte", (req: Request, res: Response) => {
  const id = extrairId(req.params.id);
  if (!id) {
    res.status(400).json({ mensagem: "Identificador não informado." });
    return;
  }

  const valor = Number(req.body.valor);
  if (isNaN(valor) || valor <= 0) {
    res.status(400).json({ mensagem: "O valor do aporte precisa ser maior que zero." });
    return;
  }

  const metaAtualizada = adicionarAporteMeta(id, valor);
  if (!metaAtualizada) {
    res.status(404).json({ mensagem: "Meta não encontrada." });
    return;
  }

  res.json(metaAtualizada);
});

app.delete("/api/metas/:id", (req: Request, res: Response) => {
  const id = extrairId(req.params.id);
  if (!id) {
    res.status(400).json({ mensagem: "Identificador não informado." });
    return;
  }

  const sucesso = removerMeta(id);
  if (!sucesso) {
    res.status(404).json({ mensagem: "Meta não encontrada." });
    return;
  }

  res.json({ mensagem: "Meta removida com sucesso." });
});

app.post("/api/simulador", (req: Request, res: Response) => {
  const valorInicial = Number(req.body.valorInicial) || 0;
  const aporteMensal = Number(req.body.aporteMensal) || 0;
  const taxaAnual = Number(req.body.taxaAnual) || 10.75;
  const meses = Number(req.body.meses) || 12;

  const resultado = calcularSimulacao({
    valorInicial,
    aporteMensal,
    taxaAnual,
    meses,
  });

  res.json(resultado);
});

app.post("/api/reiniciar", (_req: Request, res: Response) => {
  reiniciarDadosExemplo();
  res.json({ mensagem: "Dados reiniciados com sucesso." });
});

app.get("/{*caminho}", (_req: Request, res: Response) => {
  res.sendFile(path.join(pastaPublica, "index.html"));
});

app.listen(porta, () => {
  console.log(`Servidor rodando com sucesso na porta ${porta}`);
});

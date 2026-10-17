import * as fs from "fs";
import * as path from "path";
import {
  Transacao,
  MetaFinanceira,
  ResumoFinanceiro,
  ParametrosSimulacao,
  ResultadoSimulacao,
  MesSimulacao,
} from "./tipos.js";

interface BancoDados {
  transacoes: Transacao[];
  metas: MetaFinanceira[];
}

const caminhoArquivo = path.resolve(process.cwd(), "dados.json");

function gerarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

export function normalizarCategoria(categoria: string): string {
  const textoLimpo = categoria
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (!textoLimpo) {
    return "outros";
  }

  return textoLimpo.charAt(0).toUpperCase() + textoLimpo.slice(1);
}

function obterDadosIniciais(): BancoDados {
  return {
    transacoes: [
      {
        id: "ex-1",
        tipo: "renda",
        descricao: "Bolsa de Estágio",
        valor: 1500,
        categoria: "Salario",
        data: new Date().toLocaleDateString("pt-BR"),
      },
      {
        id: "ex-2",
        tipo: "renda",
        descricao: "Projeto Freelance",
        valor: 450,
        categoria: "Freelance",
        data: new Date().toLocaleDateString("pt-BR"),
      },
      {
        id: "ex-3",
        tipo: "gasto",
        descricao: "Alimentação e Mercado",
        valor: 380,
        categoria: "Alimentacao",
        data: new Date().toLocaleDateString("pt-BR"),
      },
      {
        id: "ex-4",
        tipo: "gasto",
        descricao: "Transporte e Metrô",
        valor: 180,
        categoria: "Transporte",
        data: new Date().toLocaleDateString("pt-BR"),
      },
      {
        id: "ex-5",
        tipo: "gasto",
        descricao: "Internet e Celular",
        valor: 120,
        categoria: "Contas",
        data: new Date().toLocaleDateString("pt-BR"),
      },
    ],
    metas: [
      {
        id: "meta-1",
        titulo: "Reserva de Emergência",
        valorAlvo: 3000,
        valorAtual: 1200,
        dataLimite: "31/12/2026",
      },
      {
        id: "meta-2",
        titulo: "Curso de Especialização",
        valorAlvo: 600,
        valorAtual: 350,
        dataLimite: "30/06/2026",
      },
    ],
  };
}

let estadoMemoria: BancoDados = carregarDadosDoDisco();

function carregarDadosDoDisco(): BancoDados {
  try {
    if (fs.existsSync(caminhoArquivo)) {
      const conteudo = fs.readFileSync(caminhoArquivo, "utf-8");
      const dados = JSON.parse(conteudo);
      if (Array.isArray(dados.transacoes) && Array.isArray(dados.metas)) {
        return dados;
      }
    }
  } catch {
    return obterDadosIniciais();
  }

  const inicial = obterDadosIniciais();
  salvarDadosNoDisco(inicial);
  return inicial;
}

function salvarDadosNoDisco(dados: BancoDados): void {
  try {
    fs.writeFileSync(caminhoArquivo, JSON.stringify(dados, null, 2), "utf-8");
  } catch {
    estadoMemoria = dados;
  }
}

export function listarTransacoes(categoria?: string, tipo?: string): Transacao[] {
  let lista = estadoMemoria.transacoes;

  if (tipo === "renda" || tipo === "gasto") {
    lista = lista.filter((t) => t.tipo === tipo);
  }

  if (categoria) {
    const categoriaBuscada = normalizarCategoria(categoria).toLowerCase();
    lista = lista.filter((t) =>
      t.categoria.toLowerCase().includes(categoriaBuscada)
    );
  }

  return lista;
}

export function cadastrarTransacao(dados: {
  tipo: "renda" | "gasto";
  descricao: string;
  valor: number;
  categoria: string;
  data?: string | undefined;
}): Transacao {
  const novaTransacao: Transacao = {
    id: gerarId(),
    tipo: dados.tipo,
    descricao: dados.descricao.trim(),
    valor: Math.abs(dados.valor),
    categoria: normalizarCategoria(dados.categoria),
    data: dados.data || new Date().toLocaleDateString("pt-BR"),
  };

  estadoMemoria.transacoes.unshift(novaTransacao);
  salvarDadosNoDisco(estadoMemoria);

  return novaTransacao;
}

export function removerTransacao(id: string): boolean {
  const tamanhoOriginal = estadoMemoria.transacoes.length;
  estadoMemoria.transacoes = estadoMemoria.transacoes.filter((t) => t.id !== id);

  if (estadoMemoria.transacoes.length !== tamanhoOriginal) {
    salvarDadosNoDisco(estadoMemoria);
    return true;
  }

  return false;
}

export function obterResumo(): ResumoFinanceiro {
  let totalRenda = 0;
  let totalGasto = 0;
  const gastosPorCategoria: Record<string, number> = {};

  for (const transacao of estadoMemoria.transacoes) {
    if (transacao.tipo === "renda") {
      totalRenda += transacao.valor;
    } else {
      totalGasto += transacao.valor;
      gastosPorCategoria[transacao.categoria] =
        (gastosPorCategoria[transacao.categoria] || 0) + transacao.valor;
    }
  }

  const totalGuardadoMetas = estadoMemoria.metas.reduce(
    (acumulado, meta) => acumulado + meta.valorAtual,
    0
  );

  const saldoAtual = totalRenda - totalGasto;
  const taxaPoupanca =
    totalRenda > 0 ? Math.max(0, ((totalRenda - totalGasto) / totalRenda) * 100) : 0;

  return {
    totalRenda: Number(totalRenda.toFixed(2)),
    totalGasto: Number(totalGasto.toFixed(2)),
    saldoAtual: Number(saldoAtual.toFixed(2)),
    totalGuardadoMetas: Number(totalGuardadoMetas.toFixed(2)),
    taxaPoupanca: Number(taxaPoupanca.toFixed(1)),
    gastosPorCategoria,
  };
}

export function listarMetas(): MetaFinanceira[] {
  return estadoMemoria.metas;
}

export function cadastrarMeta(dados: {
  titulo: string;
  valorAlvo: number;
  valorAtual?: number | undefined;
  dataLimite?: string | undefined;
}): MetaFinanceira {
  const novaMeta: MetaFinanceira = {
    id: gerarId(),
    titulo: dados.titulo.trim(),
    valorAlvo: Math.abs(dados.valorAlvo),
    valorAtual: Math.max(0, dados.valorAtual || 0),
    dataLimite: dados.dataLimite || "Sem prazo definido",
  };

  estadoMemoria.metas.push(novaMeta);
  salvarDadosNoDisco(estadoMemoria);

  return novaMeta;
}

export function adicionarAporteMeta(id: string, valorAporte: number): MetaFinanceira | null {
  const meta = estadoMemoria.metas.find((m) => m.id === id);
  if (!meta) {
    return null;
  }

  meta.valorAtual = Math.min(meta.valorAlvo, meta.valorAtual + Math.abs(valorAporte));
  salvarDadosNoDisco(estadoMemoria);
  return meta;
}

export function removerMeta(id: string): boolean {
  const tamanhoOriginal = estadoMemoria.metas.length;
  estadoMemoria.metas = estadoMemoria.metas.filter((m) => m.id !== id);

  if (estadoMemoria.metas.length !== tamanhoOriginal) {
    salvarDadosNoDisco(estadoMemoria);
    return true;
  }

  return false;
}

export function calcularSimulacao(parametros: ParametrosSimulacao): ResultadoSimulacao {
  const valorInicial = Math.max(0, parametros.valorInicial);
  const aporteMensal = Math.max(0, parametros.aporteMensal);
  const taxaAnual = Math.max(0, parametros.taxaAnual);
  const meses = Math.max(1, Math.floor(parametros.meses));

  const taxaMensal = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;

  let saldo = valorInicial;
  let totalInvestido = valorInicial;
  const evolucao: MesSimulacao[] = [];

  for (let mes = 1; mes <= meses; mes++) {
    const rendimentoMes = saldo * taxaMensal;
    saldo += rendimentoMes + aporteMensal;
    totalInvestido += aporteMensal;

    evolucao.push({
      mes,
      rendimentoMes: Number(rendimentoMes.toFixed(2)),
      totalInvestido: Number(totalInvestido.toFixed(2)),
      saldoFinal: Number(saldo.toFixed(2)),
    });
  }

  const rendimentoTotal = saldo - totalInvestido;

  return {
    valorInicial: Number(valorInicial.toFixed(2)),
    totalAportes: Number((aporteMensal * meses).toFixed(2)),
    totalInvestido: Number(totalInvestido.toFixed(2)),
    rendimentoTotal: Number(rendimentoTotal.toFixed(2)),
    saldoFinal: Number(saldo.toFixed(2)),
    meses,
    taxaAnual,
    evolucao,
  };
}

export function reiniciarDadosExemplo(): void {
  estadoMemoria = obterDadosIniciais();
  salvarDadosNoDisco(estadoMemoria);
}

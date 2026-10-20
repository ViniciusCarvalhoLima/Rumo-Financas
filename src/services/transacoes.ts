import {
  EstadoApp,
  Transacao,
  obterEstado,
  salvarEstado,
  validarValor,
} from "./persistencia";

export function formatarCategoria(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function obterDataAtual(): string {
  return new Date().toLocaleDateString("pt-BR");
}

export function validarCategoria(categoria: string): boolean {
  return categoria.trim().length > 0;
}

export function gerarId(estado: EstadoApp): number {
  const id = estado.proximoId;
  estado.proximoId += 1;
  return id;
}

export function cadastrarRenda(valor: number, categoria: string): void {
  if (!validarValor(valor)) {
    throw new Error("Valor inválido! Informe um número maior que zero.");
  }
  if (!validarCategoria(categoria)) {
    throw new Error("Categoria inválida! Informe uma categoria.");
  }

  const estado = obterEstado();
  categoria = formatarCategoria(categoria);
  estado.saldo += valor;
  estado.totalRenda += valor;
  const id = gerarId(estado);
  estado.transacoes.push({
    id,
    tipo: "Renda",
    categoria,
    valor,
    data: obterDataAtual(),
  });
  salvarEstado();
}

export function cadastrarGasto(valor: number, categoria: string): void {
  if (!validarValor(valor)) {
    throw new Error("Valor inválido! Informe um número maior que zero.");
  }
  if (!validarCategoria(categoria)) {
    throw new Error("Categoria inválida! Informe uma categoria.");
  }

  const estado = obterEstado();
  categoria = formatarCategoria(categoria);
  estado.saldo -= valor;
  estado.totalGasto += valor;
  const id = gerarId(estado);
  estado.transacoes.push({
    id,
    tipo: "Gasto",
    categoria,
    valor,
    data: obterDataAtual(),
  });
  salvarEstado();
}

export function listarTransacoes(): Transacao[] {
  return obterEstado().transacoes;
}

export function pesquisarCategoria(categoria: string): Transacao[] {
  const estado = obterEstado();
  categoria = formatarCategoria(categoria);
  return estado.transacoes.filter((t) => t.categoria.includes(categoria));
}

export function deletarTransacao(id: number): void {
  const estado = obterEstado();
  const transacao = estado.transacoes.find((t) => t.id === id);
  if (!transacao) {
    throw new Error("Transação não encontrada!");
  }

  const indice = estado.transacoes.indexOf(transacao);
  if (transacao.tipo === "Renda") {
    estado.saldo -= transacao.valor;
    estado.totalRenda -= transacao.valor;
  } else {
    estado.saldo += transacao.valor;
    estado.totalGasto -= transacao.valor;
  }

  estado.transacoes.splice(indice, 1);
  salvarEstado();
}

export function calcularSaldo(): {
  saldo: number;
  totalRenda: number;
  totalGasto: number;
} {
  const estado = obterEstado();
  return {
    saldo: estado.saldo,
    totalRenda: estado.totalRenda,
    totalGasto: estado.totalGasto,
  };
}
const API_BASE = "/api";

export interface Transacao {
  id: number;
  tipo: "Renda" | "Gasto";
  categoria: string;
  valor: number;
  data: string;
}

export interface Saldo {
  saldo: number;
  totalRenda: number;
  totalGasto: number;
}

export interface SimulacaoResultado {
  valorInvestido: number;
  meses: number;
  taxaSelic: number;
  rendimentoMensal: { mes: number; valor: number }[];
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const resposta = await fetch(`${API_BASE}${input}`, init);
  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    throw new Error(erro.erro || `Erro ${resposta.status}`);
  }
  return resposta.json();
}

export async function listarTransacoes(): Promise<Transacao[]> {
  return request<Transacao[]>("/transacoes");
}

export async function cadastrarTransacao(
  tipo: "Renda" | "Gasto",
  valor: number,
  categoria: string
): Promise<void> {
  await request("/transacoes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tipo, valor, categoria }),
  });
}

export async function deletarTransacao(id: number): Promise<void> {
  await request(`/transacoes/${id}`, { method: "DELETE" });
}

export async function calcularSaldo(): Promise<Saldo> {
  return request<Saldo>("/saldo");
}

export async function pesquisarCategoria(
  categoria: string
): Promise<Transacao[]> {
  const resposta = await fetch(`${API_BASE}/pesquisar?categoria=${categoria}`);
  if (!resposta.ok) return [];
  return resposta.json();
}

export async function simularInvestimento(
  valor: number,
  meses: number
): Promise<SimulacaoResultado> {
  return request<SimulacaoResultado>("/investimento/simular", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ valor, meses }),
  });
}
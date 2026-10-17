export type TipoTransacao = "renda" | "gasto";

export interface Transacao {
  id: string;
  tipo: TipoTransacao;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
}

export interface MetaFinanceira {
  id: string;
  titulo: string;
  valorAlvo: number;
  valorAtual: number;
  dataLimite: string;
}

export interface ResumoFinanceiro {
  totalRenda: number;
  totalGasto: number;
  saldoAtual: number;
  totalGuardadoMetas: number;
  taxaPoupanca: number;
  gastosPorCategoria: Record<string, number>;
}

export interface ParametrosSimulacao {
  valorInicial: number;
  aporteMensal: number;
  taxaAnual: number;
  meses: number;
}

export interface MesSimulacao {
  mes: number;
  rendimentoMes: number;
  totalInvestido: number;
  saldoFinal: number;
}

export interface ResultadoSimulacao {
  valorInicial: number;
  totalAportes: number;
  totalInvestido: number;
  rendimentoTotal: number;
  saldoFinal: number;
  meses: number;
  taxaAnual: number;
  evolucao: MesSimulacao[];
}

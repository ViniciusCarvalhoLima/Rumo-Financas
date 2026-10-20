import * as fs from "fs";
import * as path from "path";

export interface Transacao {
  id: number;
  tipo: "Renda" | "Gasto";
  categoria: string;
  valor: number;
  data: string;
}

export interface EstadoApp {
  saldo: number;
  totalRenda: number;
  totalGasto: number;
  transacoes: Transacao[];
  proximoId: number;
}

export const ARQUIVO_DADOS = path.join(__dirname, "..", "..", "data.json");

const estadoInicial: EstadoApp = {
  saldo: 0,
  totalRenda: 0,
  totalGasto: 0,
  transacoes: [],
  proximoId: 1,
};

let estado: EstadoApp = { ...estadoInicial };

export function carregarEstado(): EstadoApp {
  try {
    if (fs.existsSync(ARQUIVO_DADOS)) {
      const conteudo = fs.readFileSync(ARQUIVO_DADOS, "utf-8");
      const dados = JSON.parse(conteudo) as Partial<EstadoApp>;
      estado = {
        saldo: dados.saldo ?? 0,
        totalRenda: dados.totalRenda ?? 0,
        totalGasto: dados.totalGasto ?? 0,
        transacoes: dados.transacoes ?? [],
        proximoId: dados.proximoId ?? 1,
      };
      console.log("Dados carregados com sucesso.");
    }
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
    estado = { ...estadoInicial };
  }
  return estado;
}

export function salvarEstado(): void {
  try {
    fs.writeFileSync(ARQUIVO_DADOS, JSON.stringify(estado, null, 2), "utf-8");
  } catch (erro) {
    console.error("Erro ao salvar dados:", erro);
  }
}

export function obterEstado(): EstadoApp {
  return estado;
}

export function definirEstado(novoEstado: EstadoApp): void {
  estado = novoEstado;
}

export function validarValor(valor: number): boolean {
  return Number.isFinite(valor) && valor > 0;
}
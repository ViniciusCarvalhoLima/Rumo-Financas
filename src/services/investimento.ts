import { validarValor, obterEstado, salvarEstado } from "./persistencia";

export interface SimulacaoResultado {
  valorInvestido: number;
  meses: number;
  taxaSelic: number;
  rendimentoMensal: { mes: number; valor: number }[];
}

export function simularInvestimento(
  valor: number,
  meses: number
): SimulacaoResultado {
  if (!validarValor(valor)) {
    throw new Error("Valor inválido! Informe um número maior que zero.");
  }

  const estado = obterEstado();
  if (valor > estado.saldo) {
    throw new Error("Saldo insuficiente!");
  }
  if (!Number.isInteger(meses) || meses < 1 || meses > 120) {
    throw new Error(
      "Quantidade de meses inválida! Informe um número inteiro entre 1 e 120."
    );
  }

  const taxaSelic = 0.014;
  let rendimento = valor;
  const mensal: { mes: number; valor: number }[] = [];

  for (let mes = 1; mes <= meses; mes++) {
    rendimento += rendimento * taxaSelic;
    mensal.push({ mes, valor: rendimento });
  }

  return {
    valorInvestido: valor,
    meses,
    taxaSelic,
    rendimentoMensal: mensal,
  };
}
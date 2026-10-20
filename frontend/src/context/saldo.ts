import { createContext } from "react";
import type { Saldo } from "../api";

export type ContextoSaldo = {
  /** `null` enquanto o saldo ainda não foi carregado. */
  saldo: Saldo | null;
  carregando: boolean;
  erro: string | null;
  /** Recarrega o saldo atual (usado após cadastrar/excluir transações). */
  recarregar: () => Promise<void>;
};

export const SaldoContext = createContext<ContextoSaldo | null>(null);
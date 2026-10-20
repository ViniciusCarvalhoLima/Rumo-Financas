import { useContext } from "react";
import { SaldoContext } from "../context/saldo";
import type { ContextoSaldo } from "../context/saldo";

export function useSaldo(): ContextoSaldo {
  const contexto = useContext(SaldoContext);
  if (!contexto) {
    throw new Error("useSaldo deve ser usado dentro de <SaldoProvider>");
  }
  return contexto;
}
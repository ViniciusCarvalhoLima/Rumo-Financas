import { useContext } from "react";
import { TemaContext } from "../context/tema";
import type { ContextoTema } from "../context/tema";

export function useTema(): ContextoTema {
  const contexto = useContext(TemaContext);
  if (!contexto) {
    throw new Error("useTema deve ser usado dentro de <TemaProvider>");
  }
  return contexto;
}

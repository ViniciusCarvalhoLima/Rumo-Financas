import { createContext } from "react";

export type Tema = "claro" | "escuro";

export const CHAVE_TEMA = "tema-rumo";

/** Lê a preferência salva; `null` quando ausente ou indisponível (ex.: modo privado). */
export function lerTemaSalvo(): Tema | null {
  try {
    const salvo = window.localStorage.getItem(CHAVE_TEMA);
    return salvo === "claro" || salvo === "escuro" ? salvo : null;
  } catch {
    return null;
  }
}

/** Persiste a escolha manual; ignora falhas de armazenamento. */
export function salvarTema(tema: Tema): void {
  try {
    window.localStorage.setItem(CHAVE_TEMA, tema);
  } catch {
    /* armazenamento indisponível — o tema continua funcionando na sessão */
  }
}

/** Remove a preferência salva; ignora falhas de armazenamento. */
export function limparTemaSalvo(): void {
  try {
    window.localStorage.removeItem(CHAVE_TEMA);
  } catch {
    /* idem */
  }
}

/** `true` quando o sistema operacional pede o tema escuro. */
export function prefereSistemaEscuro(): boolean {
  try {
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  } catch {
    return false;
  }
}

export type ContextoTema = {
  tema: Tema;
  alternar: () => void;
};

export const TemaContext = createContext<ContextoTema | null>(null);

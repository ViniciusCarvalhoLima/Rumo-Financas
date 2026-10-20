import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  TemaContext,
  lerTemaSalvo,
  limparTemaSalvo,
  prefereSistemaEscuro,
  salvarTema,
} from "../context/tema";
import type { Tema } from "../context/tema";

type EstadoTema = {
  tema: Tema;
  /** `true` quando o usuário escolheu o tema manualmente (persiste em localStorage). */
  manual: boolean;
};

function estadoInicial(): EstadoTema {
  if (typeof window === "undefined") return { tema: "claro", manual: false };

  const salvo = lerTemaSalvo();
  if (salvo) return { tema: salvo, manual: true };

  return {
    tema: prefereSistemaEscuro() ? "escuro" : "claro",
    manual: false,
  };
}

export default function TemaProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoTema>(estadoInicial);
  const { tema, manual } = estado;

  // Aplica o tema ao documento e sincroniza a cor da barra do navegador.
  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    document.documentElement.style.colorScheme = tema;

    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", tema === "escuro" ? "#0b1120" : "#4f46e5");

    // Só persiste escolhas manuais — assim a preferência do sistema continua valendo.
    if (manual) {
      salvarTema(tema);
    } else {
      limparTemaSalvo();
    }
  }, [tema, manual]);

  // Acompanha a preferência do sistema enquanto não houver escolha manual.
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!query) return;

    const aoMudar = (evento: MediaQueryListEvent) => {
      setEstado((atual) =>
        atual.manual
          ? atual
          : { ...atual, tema: evento.matches ? "escuro" : "claro" },
      );
    };

    query.addEventListener("change", aoMudar);
    return () => query.removeEventListener("change", aoMudar);
  }, []);

  const alternar = useCallback(() => {
    setEstado((atual) => ({
      tema: atual.tema === "claro" ? "escuro" : "claro",
      manual: true,
    }));
  }, []);

  const valor = useMemo(() => ({ tema, alternar }), [tema, alternar]);

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}

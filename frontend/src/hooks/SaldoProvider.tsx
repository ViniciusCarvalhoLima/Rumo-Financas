import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { calcularSaldo } from "../api";
import type { Saldo } from "../api";
import { SaldoContext } from "../context/saldo";

export default function SaldoProvider({ children }: { children: ReactNode }) {
  const [saldo, setSaldo] = useState<Saldo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    try {
      const dados = await calcularSaldo();
      setSaldo(dados);
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar saldo.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    let ativo = true;

    calcularSaldo()
      .then((dados) => {
        if (!ativo) return;
        setSaldo(dados);
        setErro(null);
      })
      .catch((e: unknown) => {
        if (!ativo) return;
        setErro(e instanceof Error ? e.message : "Erro ao carregar saldo.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const valor = useMemo(
    () => ({ saldo, carregando, erro, recarregar }),
    [saldo, carregando, erro, recarregar]
  );

  return <SaldoContext.Provider value={valor}>{children}</SaldoContext.Provider>;
}
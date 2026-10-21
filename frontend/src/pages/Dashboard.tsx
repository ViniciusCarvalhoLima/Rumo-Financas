import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { calcularSaldo, listarTransacoes } from "../api";
import type { Saldo, Transacao } from "../api";
import { formatarMoeda, formatarData } from "../components/format";
import {
  IconArrowDown,
  IconArrowUp,
  IconEmpty,
  IconList,
  IconTrend,
  IconWallet,
} from "../components/Icons";

const SALDO_VAZIO: Saldo = { saldo: 0, totalRenda: 0, totalGasto: 0 };

type StatCardProps = {
  label: string;
  valor: string;
  icone: React.ReactNode;
  accent: string;
  accentBg: string;
  meta: React.ReactNode;
  valorCor?: string;
};

function StatCard({
  label,
  valor,
  icone,
  accent,
  accentBg,
  meta,
  valorCor,
}: StatCardProps) {
  const estilo = {
    "--accent": accent,
    "--accent-bg": accentBg,
  } as React.CSSProperties;

  return (
    <article className="stat-card" style={estilo}>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className="stat-icon">{icone}</span>
      </div>
      <div className="stat-value" style={valorCor ? { color: valorCor } : undefined}>
        {valor}
      </div>
      <div className="stat-meta">{meta}</div>
    </article>
  );
}

export default function Dashboard() {
  const [saldo, setSaldo] = useState<Saldo>(SALDO_VAZIO);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([calcularSaldo(), listarTransacoes()])
      .then(([dadosSaldo, dadosTransacoes]) => {
        setSaldo(dadosSaldo);
        setTransacoes(dadosTransacoes);
      })
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) {
    return (
      <div className="stats-grid">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton skeleton-card" />
        ))}
      </div>
    );
  }

  // A base da composição é a RENDA: os gastos e o saldo restante dividem
  // 100% dela. Usar (renda + gasto) contaria o mesmo dinheiro duas vezes.
  const totalRenda = saldo.totalRenda;
  const pctGasto = totalRenda > 0 ? (saldo.totalGasto / totalRenda) * 100 : 0;
  // O saldo é derivado de (renda - gasto) para que a barra sempre feche em 100%,
  // mesmo que o data.json seja editado manualmente.
  const sobra = totalRenda - saldo.totalGasto;
  const pctSobra = totalRenda > 0 ? (sobra / totalRenda) * 100 : 0;
  const taxaPoupanca =
    saldo.totalRenda > 0 ? (saldo.saldo / saldo.totalRenda) * 100 : 0;

  // A largura da barra é limitada a 0-100% para não gerar valores inválidos
  // quando os gastos ultrapassam a renda.
  const larguraGasto = Math.min(100, Math.max(0, pctGasto));
  const larguraSobra = Math.min(100, Math.max(0, pctSobra));

  const recentes = [...transacoes].slice(-5).reverse();

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">
          <IconWallet size={26} />
          Visão geral
        </h1>
        <p className="page-subtitle">
          Acompanhe sua renda, seus gastos e o saldo disponível atualizado em
          tempo real.
        </p>
      </header>

      <section className="stats-grid">
        <StatCard
          label="Total de rendas"
          valor={formatarMoeda(saldo.totalRenda)}
          icone={<IconArrowUp size={19} />}
          accent="var(--success)"
          accentBg="var(--success-light)"
          valorCor="var(--success-dark)"
          meta={
            <>
              <span className="stat-trend up">
                <IconArrowUp size={13} /> entradas
              </span>
              <span>no período</span>
            </>
          }
        />
        <StatCard
          label="Total de gastos"
          valor={formatarMoeda(saldo.totalGasto)}
          icone={<IconArrowDown size={19} />}
          accent="var(--danger)"
          accentBg="var(--danger-light)"
          valorCor="var(--danger-dark)"
          meta={
            <>
              <span className="stat-trend down">
                <IconArrowDown size={13} /> saídas
              </span>
              <span>no período</span>
            </>
          }
        />
        <StatCard
          label="Saldo atual"
          valor={formatarMoeda(saldo.saldo)}
          icone={<IconTrend size={19} />}
          accent="var(--primary)"
          accentBg="var(--primary-light)"
          valorCor="var(--primary-text)"
          meta={<span>{taxaPoupanca.toFixed(1)}% da renda preservada</span>}
        />
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Composição das receitas e despesas</h2>
            <p>Como sua renda foi distribuída entre gastos e saldo.</p>
          </div>
        </div>

        <div className="ratio-bar">
          <span className="ratio-gasto" style={{ width: `${larguraGasto}%` }} />
          <span className="ratio-sobra" style={{ width: `${larguraSobra}%` }} />
        </div>

        <div className="ratio-legend">
          <span>
            <i className="legend-dot gasto" />
            Gastos — {formatarMoeda(saldo.totalGasto)} ({pctGasto.toFixed(1)}% da
            renda)
          </span>
          <span>
            <i className="legend-dot sobra" />
            Saldo — {formatarMoeda(sobra)} ({pctSobra.toFixed(1)}% da renda)
          </span>
        </div>
      </section>
      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Últimas transações</h2>
            <p>Os 5 movimentos mais recentes.</p>
          </div>
          <Link to="/transacoes" className="btn btn-ghost">
            <IconList size={16} />
            Ver todas
          </Link>
        </div>

        {recentes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <IconEmpty size={26} />
            </div>
            <h3>Nenhuma transação por aqui</h3>
            <p>
              Cadastre sua primeira renda ou gasto na aba Transações para ver os
              dados aqui.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Categoria</th>
                  <th>Valor</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {recentes.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <span
                        className={`badge badge-${t.tipo === "Renda" ? "renda" : "gasto"}`}
                      >
                        <i className="badge-dot" />
                        {t.tipo}
                      </span>
                    </td>
                    <td className="cell-categoria">{t.categoria}</td>
                    <td
                      className={`cell-valor ${t.tipo === "Renda" ? "valor-renda" : "valor-gasto"}`}
                    >
                      {t.tipo === "Renda" ? "+ " : "− "}
                      {formatarMoeda(t.valor)}
                    </td>
                    <td className="cell-data">{formatarData(t.data)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

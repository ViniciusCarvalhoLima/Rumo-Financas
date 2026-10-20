import { useState } from "react";
import { simularInvestimento } from "../api";
import type { SimulacaoResultado } from "../api";
import { formatarMoeda } from "../components/format";
import {
  IconAlert,
  IconTrend,
} from "../components/Icons";

export default function Investimento() {
  const [valor, setValor] = useState("");
  const [meses, setMeses] = useState("12");
  const [resultado, setResultado] = useState<SimulacaoResultado | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function simular(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    const valorNum = Number(valor);
    const mesesNum = Number(meses);

    if (!valor || Number.isNaN(valorNum) || valorNum <= 0) {
      setErro("Informe um valor válido para investir.");
      return;
    }
    if (!mesesNum || Number.isNaN(mesesNum) || mesesNum < 1 || mesesNum > 120) {
      setErro("O período deve estar entre 1 e 120 meses.");
      return;
    }

    setCarregando(true);
    try {
      const res = await simularInvestimento(valorNum, mesesNum);
      setResultado(res);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao simular");
    } finally {
      setCarregando(false);
    }
  }

  const valorFinal = resultado?.rendimentoMensal.at(-1)?.valor ?? 0;
  const rendimento = resultado ? valorFinal - resultado.valorInvestido : 0;

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">
          <IconTrend size={26} />
          Simulador de investimento
        </h1>
        <p className="page-subtitle">
          Projete o rendimento do seu investimento ao longo do tempo usando a
          taxa Selic como base.
        </p>
      </header>

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Parâmetros da simulação</h2>
            <p>Informe o valor a investir e o período desejado.</p>
          </div>
        </div>

        {erro && (
          <div className="mensagem mensagem-erro" role="alert">
            <IconAlert size={17} />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={simular}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="campo-valor-investir">
                Valor a investir
              </label>
              <input
                id="campo-valor-investir"
                className="form-input"
                type="text"
                inputMode="decimal"
                placeholder="1.000,00"
                value={valor}
                onChange={(e) => setValor(e.target.value.replace(",", "."))}
              />
              <span className="form-hint">Use vírgula ou ponto para os decimais.</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="campo-meses">
                Período (meses)
              </label>
              <input
                id="campo-meses"
                className="form-input"
                type="number"
                placeholder="12"
                value={meses}
                onChange={(e) => setMeses(e.target.value)}
                min="1"
                max="120"
              />
              <span className="form-hint">Máximo de 120 meses (10 anos).</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={carregando}>
              {carregando ? <span className="spinner" /> : <IconTrend size={16} />}
              {carregando ? "Simulando..." : "Simular"}
            </button>
          </div>
        </form>
      </section>

      {resultado && (
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Resultado da simulação</h2>
              <p>Projeção de rendimento mês a mês.</p>
            </div>
          </div>

          <div className="result-summary">
            <div className="result-item">
              <span>Valor investido</span>
              <strong>{formatarMoeda(resultado.valorInvestido)}</strong>
            </div>
            <div className="result-item">
              <span>Taxa Selic mensal</span>
              <strong>{(resultado.taxaSelic * 100).toFixed(2)}%</strong>
            </div>
            <div className="result-item">
              <span>Período</span>
              <strong>{resultado.meses} meses</strong>
            </div>
            <div className="result-item accent">
              <span>Montante final</span>
              <strong>{formatarMoeda(valorFinal)}</strong>
            </div>
            <div className="result-item accent">
              <span>Rendimento total</span>
              <strong>+ {formatarMoeda(rendimento)}</strong>
            </div>
          </div>

          <div className="table-container">
            <table className="table-sim">
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Valor acumulado</th>
                </tr>
              </thead>
              <tbody>
                {resultado.rendimentoMensal.map((m) => (
                  <tr
                    key={m.mes}
                    className={m.mes === resultado.meses ? "mes-final" : undefined}
                  >
                    <td>
                      <span className="mes-num">{m.mes}</span>
                    </td>
                    <td className="valor-mes">{formatarMoeda(m.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

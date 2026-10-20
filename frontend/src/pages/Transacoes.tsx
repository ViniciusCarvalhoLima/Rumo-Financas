import { useEffect, useMemo, useState } from "react";
import {
  cadastrarTransacao,
  deletarTransacao,
  listarTransacoes,
} from "../api";
import type { Transacao } from "../api";
import { formatarMoeda, formatarData } from "../components/format";
import { useSaldo } from "../hooks/useSaldo";
import {
  IconAlert,
  IconCalendar,
  IconCheck,
  IconEmpty,
  IconList,
  IconPlus,
  IconTrash,
} from "../components/Icons";

type Mensagem = { texto: string; tipo: "sucesso" | "erro" };

export default function Transacoes() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [tipo, setTipo] = useState<"Renda" | "Gasto">("Renda");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [filtro, setFiltro] = useState("");
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);
  const [enviando, setEnviando] = useState(false);
  const { recarregar } = useSaldo();

  useEffect(() => {
    listarTransacoes().then(setTransacoes);
  }, []);

  const filtradas = useMemo(() => {
    const termo = filtro.trim().toLowerCase();
    if (!termo) return transacoes;
    return transacoes.filter(
      (t) =>
        t.categoria.toLowerCase().includes(termo) ||
        t.tipo.toLowerCase().includes(termo)
    );
  }, [transacoes, filtro]);

  const totais = useMemo(() => {
    const rendas = filtradas
      .filter((t) => t.tipo === "Renda")
      .reduce((acc, t) => acc + t.valor, 0);
    const gastos = filtradas
      .filter((t) => t.tipo === "Gasto")
      .reduce((acc, t) => acc + t.valor, 0);
    return { rendas, gastos, saldo: rendas - gastos };
  }, [filtradas]);

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    if (!valor || Number.isNaN(Number(valor))) {
      setMensagem({ texto: "Informe um valor válido.", tipo: "erro" });
      return;
    }
    if (!categoria.trim()) {
      setMensagem({ texto: "Informe a categoria.", tipo: "erro" });
      return;
    }

    setEnviando(true);
    try {
      await cadastrarTransacao(tipo, Number(valor), categoria.trim());
      setMensagem({
        texto: `${tipo} cadastrada com sucesso!`,
        tipo: "sucesso",
      });
      setValor("");
      setCategoria("");
      setTransacoes(await listarTransacoes());
      await recarregar();
    } catch (erro) {
      setMensagem({
        texto: erro instanceof Error ? erro.message : "Erro ao cadastrar",
        tipo: "erro",
      });
    } finally {
      setEnviando(false);
    }
  }

  async function excluir(id: number) {
    if (!confirm("Deseja excluir esta transação?")) return;
    try {
      await deletarTransacao(id);
      setTransacoes((atuais) => atuais.filter((t) => t.id !== id));
      await recarregar();
      setMensagem({ texto: "Transação excluída.", tipo: "sucesso" });
    } catch (erro) {
      setMensagem({
        texto: erro instanceof Error ? erro.message : "Erro ao excluir",
        tipo: "erro",
      });
    }
  }

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">
          <IconList size={26} />
          Transações
        </h1>
        <p className="page-subtitle">
          Registre rendas e gastos, consulte o histórico e acompanhe os totais
          consolidados.
        </p>
      </header>

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Nova transação</h2>
            <p>Preencha os dados abaixo para adicionar um novo lançamento.</p>
          </div>
        </div>

        {mensagem && (
          <div
            className={`mensagem mensagem-${mensagem.tipo}`}
            role="status"
            aria-live="polite"
          >
            {mensagem.tipo === "sucesso" ? (
              <IconCheck size={17} />
            ) : (
              <IconAlert size={17} />
            )}
            <span>{mensagem.texto}</span>
          </div>
        )}

        <form onSubmit={cadastrar}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="campo-tipo">
                Tipo
              </label>
              <select
                id="campo-tipo"
                className="form-input"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as "Renda" | "Gasto")}
              >
                <option value="Renda">Renda</option>
                <option value="Gasto">Gasto</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="campo-valor">
                Valor
              </label>
              <input
                id="campo-valor"
                className="form-input"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value.replace(",", "."))}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="campo-categoria">
                Categoria
              </label>
              <input
                id="campo-categoria"
                className="form-input"
                type="text"
                placeholder="Ex.: Salário, Mercado"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={enviando}>
              {enviando ? <span className="spinner" /> : <IconPlus size={16} />}
              {enviando ? "Salvando..." : "Adicionar transação"}
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Histórico</h2>
            <p>
              {filtradas.length}{" "}
              {filtradas.length === 1 ? "registro" : "registros"}
              {filtro.trim() && " (filtrado)"}
            </p>
          </div>
          <div style={{ minWidth: "280px" }}>
            <input
              className="form-input"
              type="search"
              placeholder="Buscar por categoria ou tipo..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              aria-label="Buscar transações"
            />
          </div>
        </div>

        {filtradas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <IconEmpty size={26} />
            </div>
            <h3>
              {filtro.trim() ? "Nenhum resultado encontrado" : "Nenhuma transação"}
            </h3>
            <p>
              {filtro.trim()
                ? "Tente buscar por outro termo ou limpe o filtro."
                : "Cadastre sua primeira transação usando o formulário acima."}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th className="col-id">ID</th>
                  <th>Tipo</th>
                  <th>Categoria</th>
                  <th>Valor</th>
                  <th>Data</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((t) => (
                  <tr key={t.id}>
                    <td className="cell-id col-id">#{t.id}</td>
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
                    <td className="cell-data">
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                        }}
                      >
                        <IconCalendar size={14} />
                        {formatarData(t.data)}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => excluir(t.id)}
                        className="btn-excluir"
                        aria-label={`Excluir transação ${t.id}`}
                      >
                        <IconTrash size={14} />
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="table-footer">
                  <td colSpan={3}>Totais ({filtradas.length})</td>
                  <td
                    className="cell-valor"
                    style={{ color: "var(--primary-text)" }}
                  >
                    {formatarMoeda(totais.saldo)}
                  </td>
                  <td colSpan={2} className="cell-data" style={{ fontWeight: 500 }}>
                    <span className="valor-renda">+{formatarMoeda(totais.rendas)}</span>{" "}
                    ·{" "}
                    <span className="valor-gasto">−{formatarMoeda(totais.gastos)}</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

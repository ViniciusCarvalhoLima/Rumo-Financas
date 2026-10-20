import { useSaldo } from "../hooks/useSaldo";
import { formatarMoeda } from "./format";
import { IconWallet } from "./Icons";

/**
 * Exibe o saldo atual no estilo dos apps de banco:
 * rótulo "Saldo" e valor em destaque.
 */
export default function SaldoBadge() {
  const { saldo, carregando, erro } = useSaldo();

  const valor = saldo ? formatarMoeda(saldo.saldo) : "—";
  const negativo = !!saldo && saldo.saldo < 0;

  return (
    <div
      className={`saldo-badge${negativo ? " negativo" : ""}`}
      title={erro ?? "Saldo disponível atualizado em tempo real"}
    >
      <span className="saldo-badge-icon" aria-hidden="true">
        <IconWallet size={16} />
      </span>

      <span className="saldo-badge-info">
        <span className="saldo-badge-label">Saldo</span>
        <span className="saldo-badge-valor">
          {carregando ? <span className="saldo-badge-skeleton" /> : valor}
        </span>
      </span>
    </div>
  );
}
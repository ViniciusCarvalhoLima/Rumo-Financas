import { IconMoon, IconSun } from "./Icons";
import { useTema } from "../hooks/useTema";

export default function ThemeToggle() {
  const { tema, alternar } = useTema();
  const escuro = tema === "escuro";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={alternar}
      title={escuro ? "Ativar modo claro" : "Ativar modo escuro"}
      aria-label={escuro ? "Ativar modo claro" : "Ativar modo escuro"}
      aria-pressed={escuro}
    >
      <span className="theme-toggle-icon">
        {escuro ? <IconSun size={17} /> : <IconMoon size={17} />}
      </span>
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb" />
      </span>
    </button>
  );
}

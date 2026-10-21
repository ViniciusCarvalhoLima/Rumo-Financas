import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Transacoes from "./pages/Transacoes";
import Investimento from "./pages/Investimento";
import {
  IconDashboard,
  IconList,
  IconTrend,
} from "./components/Icons";
import ThemeToggle from "./components/ThemeToggle";
import SaldoBadge from "./components/SaldoBadge";

export default function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="container navbar-inner">
            <NavLink to="/" className="navbar-brand">
              <span className="brand-mark">
                <img src="/logo.png" alt="" aria-hidden="true" className="brand-logo" />
              </span>
              <span className="brand-text">
                Rumo
                <small>Controle financeiro local</small>
              </span>
            </NavLink>

            <div className="navbar-right">
              <SaldoBadge />

              <div className="navbar-links">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `navbar-link${isActive ? " active" : ""}`
                  }
                >
                  <IconDashboard size={16} />
                  Dashboard
                </NavLink>
                <NavLink
                  to="/transacoes"
                  className={({ isActive }) =>
                    `navbar-link${isActive ? " active" : ""}`
                  }
                >
                  <IconList size={16} />
                  Transações
                </NavLink>
                <NavLink
                  to="/investimento"
                  className={({ isActive }) =>
                    `navbar-link${isActive ? " active" : ""}`
                  }
                >
                  <IconTrend size={16} />
                  Investimento
                </NavLink>
              </div>

              <ThemeToggle />
            </div>
          </div>
        </nav>

        <main className="main">
          <div className="container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transacoes" element={<Transacoes />} />
              <Route path="/investimento" element={<Investimento />} />
            </Routes>
          </div>
        </main>

        <footer className="footer">
          <div className="container footer-inner">
            <span>Rumo — dados persistidos localmente em data.json</span>
            <span>React + Express + Vite</span>
          </div>
        </footer>
      </div>
    </Router>
  );
}


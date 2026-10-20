import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import TemaProvider from './hooks/TemaProvider'
import SaldoProvider from './hooks/SaldoProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TemaProvider>
      <SaldoProvider>
        <App />
      </SaldoProvider>
    </TemaProvider>
  </StrictMode>,
)

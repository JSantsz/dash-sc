import { Routes, Route, Navigate } from 'react-router-dom';
import { FilterProvider } from './context/FilterContext';
import { AppShell } from './components/layout/AppShell';
import Overview from './pages/Overview';
import LocalizadosPage from './pages/LocalizadosPage';
import PromessasPage from './pages/PromessasPage';
import DepositosPage from './pages/DepositosPage';
import Operadores from './pages/Operadores';
import ResumoExecutivo from './pages/ResumoExecutivo';
import ResumoBaixas from './pages/ResumoBaixas';
import LigacoesPage from './pages/LigacoesPage';
import ProdutividadePage from './pages/ProdutividadePage';
import AtendimentoSC from './pages/AtendimentoSC';
import UtilizacaoAppPage from './pages/UtilizacaoAppPage';
import './styles/dashboard.css';

export default function App() {
  return (
    <FilterProvider>
      <AppShell>
        <Routes>
          <Route path="/"                                  element={<Overview />} />
          <Route path="/resumo/:carteira/localizados"      element={<LocalizadosPage />} />
          <Route path="/resumo/:carteira/promessas"        element={<PromessasPage />} />
          <Route path="/resumo/:carteira/depositos"        element={<DepositosPage />} />
          <Route path="/operadores"                        element={<Operadores />} />
          <Route path="/resumo-executivo"                  element={<ResumoExecutivo />} />
          <Route path="/resumo-baixas"                     element={<ResumoBaixas />} />
          <Route path="/ligacoes"                          element={<LigacoesPage />} />
          <Route path="/produtividade"                     element={<ProdutividadePage />} />
          <Route path="/atendimento-sc"                    element={<AtendimentoSC />} />
          <Route path="/utilizacao-app"                    element={<UtilizacaoAppPage />} />
          <Route path="*"                                  element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </FilterProvider>
  );
}

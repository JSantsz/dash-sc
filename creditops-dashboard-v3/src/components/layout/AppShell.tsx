import { useEffect, ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useFilters } from '../../context/FilterContext';
const AUTO_REFRESH_MS = 5 * 60 * 1000;
export function AppShell({ children }: { children: ReactNode }) {
  const { refresh } = useFilters();
  useEffect(() => {
    const id = setInterval(refresh, AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);
  return (
    <div className="dashboard-root" style={{ display:'flex' }}>
      <Sidebar />
      <div className="dash-main">
        <Header />
        <main className="dash-content">{children}</main>
      </div>
    </div>
  );
}

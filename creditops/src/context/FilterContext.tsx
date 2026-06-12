import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Filters {
  carteira: string;
  segmento: string;
  operador: string;
  produto: string;
}

interface FilterContextValue {
  filters: Filters;
  setFilter: (key: keyof Filters, value: string) => void;
  resetFilters: () => void;
  lastUpdated: Date;
  refresh: () => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  setLastUpdated: (d: Date) => void;
}

export const defaultFilters: Filters = {
  carteira: 'all',
  segmento: 'all',
  operador: 'all',
  produto: 'all',
};

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const setFilter = useCallback((key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => setFilters(defaultFilters), []);

  const refresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => { setLastUpdated(new Date()); setIsLoading(false); }, 800);
  }, []);

  return (
    <FilterContext.Provider value={{ filters, setFilter, resetFilters, lastUpdated, refresh, isLoading, setIsLoading, setLastUpdated }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used within FilterProvider');
  return ctx;
}

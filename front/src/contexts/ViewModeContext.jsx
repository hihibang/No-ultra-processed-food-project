import { createContext, useCallback, useState } from 'react';

export const ViewModeContext = createContext();

export function ViewModeProvider({ children }) {
  const [viewMode, setViewMode] = useState('home');

  const switchView = useCallback((mode) => {
    if (['home', 'catalog'].includes(mode)) {
      setViewMode(mode);
    }
  }, []);

  const value = { viewMode, switchView };

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  );
}

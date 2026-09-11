import { createContext, useCallback, useState } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(null);

  const login = useCallback((name) => {
    setIsLoggedIn(true);
    setUserName(name);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserName(null);
  }, []);

  const signup = useCallback((name) => {
    setIsLoggedIn(true);
    setUserName(name);
  }, []);

  const value = { isLoggedIn, userName, login, logout, signup };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './styles/globalStyles';
import { theme } from './styles/theme';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ViewModeProvider } from './contexts/ViewModeContext';
import { SearchProvider } from './contexts/SearchContext';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import JournalPage from './pages/JournalPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <ViewModeProvider>
              <SearchProvider>
                <Router>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/catalog" element={<CatalogPage />} />
                    <Route path="/journal" element={<JournalPage />} />
                  </Routes>
                </Router>
              </SearchProvider>
            </ViewModeProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

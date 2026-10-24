import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './styles/globalStyles';
import { theme } from './styles/theme';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { CompareProvider } from './contexts/CompareContext';
import { ViewModeProvider } from './contexts/ViewModeContext';
import { SearchProvider } from './contexts/SearchContext';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import JournalPage from './pages/JournalPage';
import AIChatPage from './pages/AIChatPage';
import MyPage from './pages/MyPage';
import ComparePage from './pages/ComparePage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <CompareProvider>
              <ViewModeProvider>
                <SearchProvider>
                <Router>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/catalog" element={<CatalogPage />} />
                    <Route path="/journal" element={<JournalPage />} />
                    <Route path="/ai-chat" element={<AIChatPage />} />
                    <Route path="/mypage" element={<MyPage />} />
                    <Route path="/compare" element={<ComparePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/wishlist" element={<Navigate to="/mypage?tab=wishlist" replace />} />
                  </Routes>
                </Router>
                </SearchProvider>
              </ViewModeProvider>
            </CompareProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

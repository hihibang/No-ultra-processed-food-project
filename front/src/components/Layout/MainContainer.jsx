import { useEffect } from 'react';
import { useViewMode } from '../../hooks/useViewMode';
import TopBanner from './TopBanner';
import Header from './Header';
import Footer from './Footer';
import Toast from '../Common/Toast';
import { LayoutWrapper, MainContent } from './styles/MainContainer.styles';

function MainContainer({ children, onSearch }) {
  const { viewMode } = useViewMode();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [viewMode]);

  return (
    <LayoutWrapper>
      <TopBanner />
      <Header onSearch={onSearch} />
      <MainContent>
        {children}
      </MainContent>
      <Footer />
      <Toast />
    </LayoutWrapper>
  );
}

export default MainContainer;

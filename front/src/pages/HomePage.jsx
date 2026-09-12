import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { useViewMode } from '../hooks/useViewMode';
import MainContainer from '../components/Layout/MainContainer';
import HeroSection from '../components/Features/HeroSection';
import CategoriesSection from '../components/Features/CategoriesSection';
import TimeDealSection from '../components/Features/TimeDealSection';
import BottomFeaturesSection from '../components/Features/BottomFeaturesSection';

function HomePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { switchView } = useViewMode();

  const handleSearch = (searchQuery) => {
    showToast(`'${searchQuery}'에 대해 검색하시겠습니까?`, 'success', 2000);
  };

  const handleHeroPopup = () => {
    showToast('🎁 쿠폰 팝업이 열렸습니다!', 'success');
  };

  const handleCatalogClick = () => {
    switchView('catalog');
    navigate('/catalog');
  };

  const handleCategoryClick = (category) => {
    showToast(`${category.title} 카테고리로 이동합니다.`, 'success');
  };

  const handleViewAll = () => {
    switchView('catalog');
    navigate('/catalog');
  };

  return (
    <MainContainer onSearch={handleSearch}>
      <HeroSection
        onPopupOpen={handleHeroPopup}
        onCatalogClick={handleCatalogClick}
      />
      <CategoriesSection onCategoryClick={handleCategoryClick} />
      <TimeDealSection onViewAll={handleViewAll} />
      <BottomFeaturesSection />
    </MainContainer>
  );
}

export default HomePage;
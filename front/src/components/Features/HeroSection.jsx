import Button from '../Common/Button';
import {
  HeroSectionWrapper,
  HeroBanner,
  HeroContent,
  HeroButtons,
} from './styles/HeroSection.styles';

function HeroSection({ onPopupOpen, onCatalogClick }) {
  return (
    <HeroSectionWrapper>
      <HeroBanner>
        <HeroContent>
          <h1>🎁 성분 중심의 건강한 식품 마켓에 오신 것을 환영합니다</h1>
          <p>원하는 성분을 찾거나 피하고 싶은 원재료를 검색하세요. 당신의 건강한 선택을 도와드립니다.</p>
          <HeroButtons>
            <Button
              variant="primary"
              size="lg"
              onClick={onPopupOpen}
            >
              🎁 메인 팝업창 열기 & 쿠폰 받기
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={onCatalogClick}
            >
              인기 성분 식품관 가기 →
            </Button>
          </HeroButtons>
        </HeroContent>
      </HeroBanner>
    </HeroSectionWrapper>
  );
}

export default HeroSection;

import styled from 'styled-components';
import Button from '../Common/Button';
import { containerMax } from '../../styles/mixins';

const HeroSectionWrapper = styled.section`
  padding: 1.25rem 1.5rem 0;
`;

const HeroBanner = styled.div`
  position: relative;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  min-height: 400px;
  background: linear-gradient(135deg, #005f2c 0%, #009245 50%, #16a34a 100%);
  display: flex;
  align-items: center;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 10;
  padding: 3rem;
  color: ${({ theme }) => theme.colors.white};
  max-width: 750px;

  h1 {
    font-size: 2.5rem;
    font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
    line-height: 1.2;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.05rem;
    margin-bottom: 1.5rem;
    opacity: 0.95;
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

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

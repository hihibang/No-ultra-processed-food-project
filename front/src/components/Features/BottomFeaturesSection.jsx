import styled from 'styled-components';
import { containerMax } from '../../styles/mixins';

const BottomFeaturesSectionWrapper = styled.section`
  ${containerMax}
  padding: 2.5rem 1.5rem 0;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const FeatureCard = styled.div`
  position: relative;
  min-height: 340px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }

  background-image: url(${({ bgImage }) => bgImage});
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
`;

const FeatureOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ isGreenTint }) =>
    isGreenTint
      ? 'linear-gradient(180deg, rgba(6, 78, 59, 0.4) 0%, rgba(6, 78, 59, 0.92) 100%)'
      : 'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.88) 100%)'};
`;

const FeatureCardContent = styled.div`
  position: relative;
  z-index: 10;
  padding: 2.5rem;
  color: ${({ theme }) => theme.colors.white};
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const FeatureTag = styled.span`
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  color: ${({ theme }) => theme.colors.accentYellow};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
  padding: 0.2rem 0.6rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  width: fit-content;
  margin-bottom: 0.5rem;
`;

const FeatureTitle = styled.h3`
  font-size: 2rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
  margin-bottom: 0.5rem;
  line-height: 1.2;
`;

const FeatureDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  opacity: 0.95;
  margin: 0;
`;

const FEATURES = [
  {
    id: 1,
    tag: '전문가 추천',
    title: '영양 전문가가 추천하는 건강 식품',
    description: '과학 기반의 건강한 선택',
    bgImage: '/images/div.relative-1.png',
    isGreenTint: false,
  },
  {
    id: 2,
    tag: 'AI 추천',
    title: 'AI가 추천하는 나만의 건강 식품',
    description: '개인 맞춤형 추천',
    bgImage: '/images/div.relative-2.png',
    isGreenTint: true,
  },
  {
    id: 3,
    tag: '신상품',
    title: '새로운 건강 식품 입점',
    description: '최신 트렌드 제품들',
    bgImage: '/images/div.relative-3.png',
    isGreenTint: false,
  },
];

function BottomFeaturesSection() {
  return (
    <BottomFeaturesSectionWrapper>
      <FeaturesGrid>
        {FEATURES.map(feature => (
          <FeatureCard
            key={feature.id}
            bgImage={feature.bgImage}
            role="button"
            tabIndex={0}
          >
            <FeatureOverlay isGreenTint={feature.isGreenTint} />
            <FeatureCardContent>
              <FeatureTag>{feature.tag}</FeatureTag>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCardContent>
          </FeatureCard>
        ))}
      </FeaturesGrid>
    </BottomFeaturesSectionWrapper>
  );
}

export default BottomFeaturesSection;

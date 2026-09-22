import styled from 'styled-components';
import { containerMax } from '../../../styles/mixins';

export const BottomFeaturesSectionWrapper = styled.section`
  ${containerMax}
  padding: 2.5rem 1.5rem 0;
`;

export const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

export const FeatureCard = styled.div`
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

  background-image: url(${({ $bgImage }) => $bgImage});
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
`;

export const FeatureOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ $isGreenTint }) =>
    $isGreenTint
      ? 'linear-gradient(180deg, rgba(6, 78, 59, 0.4) 0%, rgba(6, 78, 59, 0.92) 100%)'
      : 'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.88) 100%)'};
`;

export const FeatureCardContent = styled.div`
  position: relative;
  z-index: 10;
  padding: 2.5rem;
  color: ${({ theme }) => theme.colors.white};
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

export const FeatureTag = styled.span`
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

export const FeatureTitle = styled.h3`
  font-size: 2rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
  margin-bottom: 0.5rem;
  line-height: 1.2;
`;

export const FeatureDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  opacity: 0.95;
  margin: 0;
`;
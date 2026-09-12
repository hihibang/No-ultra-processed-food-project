import styled from 'styled-components';

export const HeroSectionWrapper = styled.section`
  padding: 1.25rem 1.5rem 0;
`;

export const HeroBanner = styled.div`
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

export const HeroContent = styled.div`
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

export const HeroButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

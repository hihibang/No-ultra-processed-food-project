import { useState } from 'react';
import styled from 'styled-components';
import { flexBetween, containerMax } from '../../styles/mixins';

const BannerWrapper = styled.div`
  background: linear-gradient(90deg, #005f2c, #009245, #16a34a);
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  padding: 0.4rem 1rem;
  display: ${({ isVisible }) => (isVisible ? 'block' : 'none')};
`;

const BannerInner = styled.div`
  ${containerMax}
  ${flexBetween}
`;

const BannerText = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BadgeWelcome = styled.span`
  background-color: rgba(255, 255, 255, 0.2);
  color: ${({ theme }) => theme.colors.accentYellow};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
  padding: 0.15rem 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
`;

const TextButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.accentYellow};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  padding: 0;
  transition: color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.white};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  transition: color 0.15s ease;
  font-family: inherit;

  &:hover {
    color: ${({ theme }) => theme.colors.white};
  }
`;

function TopBanner({ onCouponClick, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleCouponClick = () => {
    onCouponClick?.();
  };

  return (
    <BannerWrapper isVisible={isVisible}>
      <BannerInner>
        <BannerText>
          <BadgeWelcome>WELCOME</BadgeWelcome>
          <TextButton onClick={handleCouponClick}>혜택 받기 →</TextButton>
        </BannerText>
        <CloseButton onClick={handleClose}>✕</CloseButton>
      </BannerInner>
    </BannerWrapper>
  );
}

export default TopBanner;

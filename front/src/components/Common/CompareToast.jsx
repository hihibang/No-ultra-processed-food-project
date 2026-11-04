import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// 2개 이상 담겼을 때는 '비교함으로 가기' 버튼을 눌 시간을 주기 위해 최소 표시 시간을 늘린다
const COMPARE_ACTION_MIN_DURATION = 5000;

const CompareToastWrapper = styled.div`
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 10px 32px rgba(16, 185, 129, 0.3);
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 400px;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(100px);
      opacity: 0;
    }
  }

  &.closing {
    animation: slideOut 0.3s ease-in forwards;
  }

  @media (max-width: 768px) {
    bottom: 20px;
    right: 20px;
    left: 20px;
    max-width: none;
  }
`;

const ToastIcon = styled.div`
  font-size: 24px;
  flex-shrink: 0;
`;

const ToastContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const ToastTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
`;

const ToastMessage = styled.div`
  font-size: 13px;
  opacity: 0.95;
`;

const ToastCount = styled.div`
  background: rgba(255, 255, 255, 0.25);
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
`;

const ToastActionButton = styled.button`
  background: white;
  color: #059669;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

function CompareToast({
  isOpen,
  onClose,
  productName = '상품',
  compareCount = 0,
  duration = 3000
}) {
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();
  const canGoToCompare = compareCount >= 2;
  const effectiveDuration = canGoToCompare
    ? Math.max(duration, COMPARE_ACTION_MIN_DURATION)
    : duration;

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => {
        onClose();
        setIsClosing(false);
      }, 300);
    }, effectiveDuration);

    return () => clearTimeout(timer);
  }, [isOpen, effectiveDuration, onClose]);

  if (!isOpen) return null;

  const handleGoToCompare = () => {
    onClose();
    navigate('/compare');
  };

  return (
    <CompareToastWrapper className={isClosing ? 'closing' : ''}>
      <ToastIcon>✓</ToastIcon>
      <ToastContent>
        <ToastTitle>비교함에 담았어요!</ToastTitle>
        <ToastMessage>{productName}</ToastMessage>
      </ToastContent>
      <ToastCount>{compareCount}개</ToastCount>
      {canGoToCompare && (
        <ToastActionButton type="button" onClick={handleGoToCompare}>
          비교함으로 가기
        </ToastActionButton>
      )}
      <CloseButton onClick={() => onClose()}>×</CloseButton>
    </CompareToastWrapper>
  );
}

export default CompareToast;

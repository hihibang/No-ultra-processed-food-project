import { useState, useEffect } from 'react';
import styled from 'styled-components';

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

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => {
        onClose();
        setIsClosing(false);
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <CompareToastWrapper className={isClosing ? 'closing' : ''}>
      <ToastIcon>✓</ToastIcon>
      <ToastContent>
        <ToastTitle>비교함에 담았어요!</ToastTitle>
        <ToastMessage>{productName}</ToastMessage>
      </ToastContent>
      <ToastCount>{compareCount}개</ToastCount>
      <CloseButton onClick={() => onClose()}>×</CloseButton>
    </CompareToastWrapper>
  );
}

export default CompareToast;

import styled, { keyframes } from 'styled-components';
import { useToast } from '../../hooks/useToast';

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideUp = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: ${({ theme }) => theme.zIndex.toast};
  pointer-events: none;
`;

const ToastItem = styled.div`
  background-color: rgba(25, 25, 25, 0.95);
  color: #fff;
  padding: 0.65rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: ${({ theme }) => theme.shadows.heavy};
  pointer-events: auto;
  animation: ${slideDown} 0.3s ease-out;
  margin-top: 0.5rem;

  &.exit {
    animation: ${slideUp} 0.3s ease-out;
  }

  ${({ type }) => {
    switch (type) {
      case 'success':
        return `background-color: rgba(22, 163, 74, 0.95);`;
      case 'error':
        return `background-color: rgba(220, 38, 38, 0.95);`;
      case 'warning':
        return `background-color: rgba(245, 158, 11, 0.95);`;
      default:
        return '';
    }
  }}
`;

function Toast() {
  const { toasts } = useToast();

  return (
    <ToastContainer>
      {toasts.map(toast => (
        <ToastItem key={toast.id} type={toast.type}>
          <span>{toast.message}</span>
        </ToastItem>
      ))}
    </ToastContainer>
  );
}

export default Toast;

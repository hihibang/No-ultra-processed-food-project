import { useEffect } from 'react';
import {
  ModalOverlay,
  ModalContainer,
  ModalCloseButton,
} from './styles/Modal.styles'; // 스타일 파일 경로에 맞게 확인

function Modal({ isOpen, onClose, children }) {
  // ESC 키 누르면 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      {/* 모달 내부 클릭 시 닫히지 않도록 이벤트 전파 차단 */}
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        {/* 우측 상단 닫기 (✕) 버튼 */}
        <ModalCloseButton type="button" onClick={onClose} aria-label="닫기">
          ✕
        </ModalCloseButton>

        {children}
      </ModalContainer>
    </ModalOverlay>
  );
}

export default Modal;
import { Overlay, ModalContent, CloseButton } from './styles/Modal.styles';

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalContent>
        <CloseButton onClick={onClose}>✕</CloseButton>
        {children}
      </ModalContent>
    </Overlay>
  );
}

export default Modal;

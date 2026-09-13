import styled from 'styled-components';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999; /* 화면의 모든 UI(사이드바 포함)보다 최상단에 배치 */
  backdrop-filter: blur(2px);
`;

export const ModalContainer = styled.div`
  position: relative; /* ✕ 버튼 배치의 기준점 */
  width: 100%;
  max-width: 440px;
  background-color: #ffffff;
  border-radius: 20px;
  padding: 2.5rem 2rem 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
`;

export const ModalCloseButton = styled.button`
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 50%;
  font-size: 1.1rem;
  line-height: 1;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  &:hover {
    background-color: #f1f5f9;
    color: #0f172a;
  }
`;
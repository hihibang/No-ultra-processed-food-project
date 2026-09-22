import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    width: 95%;
    max-height: 95vh;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 32px 32px 0 32px;
  margin-bottom: 16px;
  gap: 16px;

  @media (max-width: 768px) {
    padding: 24px 20px 0 20px;
  }
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.4;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 32px;
  color: #ccc;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #999;
  }
`;

export const Meta = styled.div`
  display: flex;
  gap: 12px;
  padding: 0 32px;
  margin-bottom: 24px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    padding: 0 20px;
  }
`;

export const MetaItem = styled.span`
  font-size: 13px;
  color: #999;
  font-weight: 500;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 32px 32px 32px;

  @media (max-width: 768px) {
    padding: 0 20px 24px 20px;
  }
`;

export const Body = styled.div`
  font-size: 14px;
  line-height: 1.8;
  color: #555;
  white-space: pre-wrap;
  word-break: break-word;
`;

export const ProductsSection = styled.div`
  border-top: 1px solid #e5e7eb;
  padding-top: 24px;
`;

export const ProductTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
`;

export const ProductList = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const ProductItem = styled.span`
  background: #f0f0f0;
  color: #555;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #e5e7eb;
`;

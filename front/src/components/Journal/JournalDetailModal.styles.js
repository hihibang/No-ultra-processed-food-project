import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
  padding: 40px;

  @media (max-width: 768px) {
    width: 95%;
    max-height: 95vh;
    padding: 24px;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.4;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 32px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  flex-shrink: 0;

  &:hover {
    color: #333;
  }
`;

export const Meta = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

export const MetaItem = styled.span`
  font-size: 12px;
  color: #999;
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 4px;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const Body = styled.div`
  font-size: 14px;
  line-height: 1.8;
  color: #4b5563;
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
  background: #dcfce7;
  color: #15803d;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

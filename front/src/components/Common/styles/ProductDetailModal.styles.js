import styled from 'styled-components';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
`;

export const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #222;
  margin: 0;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #333;
  }
`;

export const ModalBody = styled.div`
  padding: 24px;
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

export const ImageSection = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
  border-radius: 8px;
  min-height: 350px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 8px;
  }

  .badge {
    position: absolute;
    top: 12px;
    right: 12px;
  }
`;

export const DetailsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const ProductName = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #222;
  margin: 0;
`;

export const ProductBrand = styled.p`
  font-size: 14px;
  color: #888;
  margin: 0;
`;

export const PriceSection = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
`;

export const OriginalPrice = styled.span`
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
`;

export const CurrentPrice = styled.span`
  font-size: 28px;
  font-weight: 700;
  color: #1a73e8;
`;

export const RatingBadge = styled.span`
  font-size: 14px;
  color: #666;
  background: #f0f0f0;
  padding: 4px 12px;
  border-radius: 20px;
`;

export const DescriptionText = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: #666;
  margin: 12px 0 0 0;
`;

export const BadgesRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const Badge = styled.span`
  display: inline-block;
  background: #e8f0fe;
  color: #1a73e8;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  align-items: center;
`;

export const AddToCartButton = styled.button`
  flex: 1;
  background: #1a73e8;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background: #1557b0;
  }
`;

export const WishlistButton = styled.button`
  width: 48px;
  height: 48px;
  border: 2px solid #ddd;
  background: ${(props) => (props.$isWished ? '#ffe0e0' : 'white')};
  border-color: ${(props) => (props.$isWished ? '#ff4444' : '#ddd')};
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.$isWished ? '#ff4444' : '#999')};

  svg {
    width: 22px;
    height: 22px;
  }

  &:hover {
    border-color: #ff4444;
    color: #ff4444;
  }
`;

export const IngredientsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const ComparisonSection = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
`;

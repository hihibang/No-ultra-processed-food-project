import styled from 'styled-components';

export const ComparisonContainer = styled.div`
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  margin-top: 20px;
`;

export const ComparisonHeader = styled.div`
  margin-bottom: 20px;

  h3 {
    font-size: 16px;
    font-weight: 700;
    color: #222;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 13px;
    color: #999;
    margin: 0;
  }
`;

export const ComparisonGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
`;

export const ComparisonRow = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr 40px 1fr;
  gap: 12px;
  padding: 12px;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

export const ComparisonLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #666;
  text-align: left;

  @media (max-width: 600px) {
    font-weight: 700;
    color: #222;
  }
`;

export const ComparisonValue = styled.div`
  font-size: 13px;
  color: #666;
  text-align: center;

  @media (max-width: 600px) {
    text-align: left;
    color: #999;
  }
`;

export const HighlightCell = styled.div`
  padding: 12px;
  background: ${(props) => (props.$isHighlight ? '#e8f5e9' : 'white')};
  border-radius: 6px;
  font-size: 13px;
  font-weight: ${(props) => (props.$isHighlight ? '700' : '600')};
  color: ${(props) => (props.$isHighlight ? '#2e7d32' : '#333')};
  text-align: center;
  border: 1px solid ${(props) => (props.$isHighlight ? '#4caf50' : '#f0f0f0')};

  .product-name {
    font-weight: 600;
    color: #222;
  }

  @media (max-width: 600px) {
    text-align: left;
  }
`;

export const PingPongTipBox = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: #fffacd;
  border-left: 4px solid #ffc107;
  border-radius: 8px;
`;

export const TipTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #f57f17;
  margin-bottom: 8px;
`;

export const TipText = styled.div`
  font-size: 13px;
  line-height: 1.6;
  color: #555;
`;

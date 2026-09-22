import styled from 'styled-components';

export const CardContainer = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
`;

export const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-top: 66.67%;
  overflow: hidden;
  background: #f0f0f0;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const CategoryTag = styled.span`
  position: absolute;
  top: 12px;
  left: 12px;
  background: #dcfce7;
  color: #15803d;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  z-index: 1;
`;

export const ReadTime = styled.span`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.9);
  color: #666;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  z-index: 1;
`;

export const Content = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.4;
`;

export const Summary = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const ProductChips = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
`;

export const ProductChip = styled.span`
  background: #f3f4f6;
  color: #666;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

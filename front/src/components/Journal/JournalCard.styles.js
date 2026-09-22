import styled from 'styled-components';

export const CardContainer = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
`;

export const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-top: 75%;
  overflow: hidden;
  background: #f0f0f0;
  flex-shrink: 0;

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
  top: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  z-index: 1;
`;

export const Content = styled.div`
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

export const ReadTime = styled.span`
  font-size: 12px;
  color: #999;
  font-weight: 500;
`;

export const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const Summary = styled.p`
  margin: 0;
  font-size: 13px;
  color: #888;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const ProductInfo = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #eee;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

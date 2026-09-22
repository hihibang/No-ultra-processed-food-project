import styled from 'styled-components';

export const CardContainer = styled.article`
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #eef2f6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  }
`;

export const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 180px;
  background-color: #f1f5f9;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

export const CategoryTag = styled.span`
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(4px);
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
`;

export const Content = styled.div`
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const ReadTime = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
  margin-bottom: 6px;
`;

export const Title = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  line-height: 1.4;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 42px;
`;

export const Summary = styled.p`
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 16px 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ProductInfo = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 5px 10px;
  border-radius: 6px;
  align-self: flex-start;
  font-size: 11px;
  font-weight: 600;
  color: #334155;
  max-width: 100%;
  box-sizing: border-box;
`;
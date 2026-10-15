import styled from 'styled-components';
import Button from '../../Common/Button';
import { containerMax } from '../../../styles/mixins';

export const SectionWrapper = styled.section`
  ${containerMax}
  width: 100%;
  padding: 2.5rem 1.5rem;
  box-sizing: border-box;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  width: 100%;
`;

export const SectionLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 700;
  color: #10b981;
  background-color: #ecfdf5;
  padding: 4px 8px;
  border-radius: 6px;
  margin-bottom: 8px;
`;

export const GridContainer = styled.div`
  display: grid;
  /* 4개 카드가 컨테이너 전체 너비를 균등 분할하여 꽉 차도록 설정 */
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.25rem;
  width: 100%;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const CardWrapper = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  width: 100%;

  &:hover {
    border-color: #10b981;
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.06);
  }
`;

export const CardImage = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const DayBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: #ef4444;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.8rem;
`;

export const PriceBadge = styled.div`
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.85rem;
`;

export const CardContent = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const CardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
`;

export const CardDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1rem 0;
  flex: 1;
  line-height: 1.5;
`;

export const CardButton = styled(Button)`
  width: 100%;
  
  /* 두 버튼(a, button)의 텍스트 스타일 완벽 고정 */
  font-size: 14px !important;
  font-weight: 600 !important;
  line-height: 1.4 !important;
  
  margin-top: auto;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;
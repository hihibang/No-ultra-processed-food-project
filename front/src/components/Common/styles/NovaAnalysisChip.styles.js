import styled from 'styled-components';

export const ChipContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
`;

export const NovaGradeChip = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${(props) => props.$color}15;
  border: 2px solid ${(props) => props.$color};
  border-radius: 8px;

  .label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: ${(props) => props.$color};
  }

  .grade {
    font-size: 24px;
    font-weight: 700;
    color: ${(props) => props.$color};
  }

  .text {
    font-size: 13px;
    font-weight: 600;
    color: ${(props) => props.$color};
  }
`;

export const BadgesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${(props) => {
    if (props.$badgeType === 'low-sugar') return '#e8f5e9';
    if (props.$badgeType === 'high-protein') return '#e3f2fd';
    if (props.$badgeType === 'no-additive') return '#f3e5f5';
    return '#f5f5f5';
  }};
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: ${(props) => {
    if (props.$badgeType === 'low-sugar') return '#2e7d32';
    if (props.$badgeType === 'high-protein') return '#1565c0';
    if (props.$badgeType === 'no-additive') return '#6a1b9a';
    return '#666';
  }};

  .icon {
    font-size: 14px;
  }
`;

export const ShefNoteContainer = styled.div`
  padding: 12px;
  background: #fffbf0;
  border-left: 4px solid #ff9800;
  border-radius: 4px;
`;

export const ShefNoteText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  line-height: 1.5;

  .title {
    font-weight: 700;
    color: #ff9800;
  }

  .note {
    color: #666;
  }
`;

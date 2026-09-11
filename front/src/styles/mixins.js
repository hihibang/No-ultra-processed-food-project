import { css } from 'styled-components';

export const flexCenter = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const flexBetween = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const flexColumn = css`
  display: flex;
  flex-direction: column;
`;

export const truncateText = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const truncateLines = (lines = 2) => css`
  display: -webkit-box;
  -webkit-line-clamp: ${lines};
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const absoluteCenter = css`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const responseText = (mobile, tablet, desktop) => css`
  @media (max-width: 640px) {
    font-size: ${mobile};
  }
  @media (min-width: 641px) and (max-width: 1024px) {
    font-size: ${tablet};
  }
  @media (min-width: 1025px) {
    font-size: ${desktop};
  }
`;

export const buttonReset = css`
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  font-family: inherit;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const containerMax = css`
  max-width: 1680px;
  margin: 0 auto;
  padding: 0 1.5rem;
`;

export const gradientText = (fromColor, toColor) => css`
  background: linear-gradient(90deg, ${fromColor}, ${toColor});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const smoothTransition = (property = 'all', duration = '0.15s') => css`
  transition: ${property} ${duration} ease;
`;

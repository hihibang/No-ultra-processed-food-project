import styled, { css } from 'styled-components';
import { flexCenter } from '../../styles/mixins';

const StyledBadge = styled.span`
  ${flexCenter}
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  padding: 0.15rem 0.5rem;

  ${({ type, theme }) => {
    switch (type) {
      case 'welcome':
        return css`
          background-color: rgba(255, 255, 255, 0.2);
          color: ${theme.colors.accentYellow};
        `;
      case 'ai':
        return css`
          background-color: ${theme.colors.primary};
          color: ${theme.colors.white};
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
        `;
      case 'user':
        return css`
          background-color: ${theme.colors.bgGray};
          color: ${theme.colors.textMain};
          font-size: 0.75rem;
          padding: 0.35rem 0.75rem;
        `;
      case 'counter':
        return css`
          background-color: ${({ isRed }) => (isRed ? '#dc2626' : theme.colors.primary)};
          color: ${theme.colors.white};
          width: 1.25rem;
          height: 1.25rem;
          padding: 0;
          font-size: 0.65rem;
        `;
      default:
        return css``;
    }
  }}
`;

function Badge({ label, type = 'default', isRed = false }) {
  return (
    <StyledBadge type={type} isRed={isRed}>
      {label}
    </StyledBadge>
  );
}

export default Badge;

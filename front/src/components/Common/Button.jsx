import styled, { css } from 'styled-components';
import { smoothTransition, buttonReset } from '../../styles/mixins';

const baseStyles = css`
  ${buttonReset}
  ${smoothTransition()}
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StyledButton = styled.button`
  ${baseStyles}

  ${({ variant, theme }) => {
    switch (variant) {
      case 'primary':
        return css`
          background-color: ${theme.colors.primary};
          color: ${theme.colors.white};

          &:hover:not(:disabled) {
            background-color: ${theme.colors.primaryHover};
          }
        `;
      case 'secondary':
        return css`
          background-color: ${theme.colors.bgGray};
          color: ${theme.colors.textMain};
          border: 1px solid ${theme.colors.borderColor};

          &:hover:not(:disabled) {
            background-color: ${theme.colors.borderColor};
          }
        `;
      case 'line':
        return css`
          border: 1px solid ${theme.colors.primary};
          color: ${theme.colors.primary};

          &:hover:not(:disabled) {
            background-color: rgba(0, 146, 69, 0.05);
          }
        `;
      case 'text':
        return css`
          color: ${theme.colors.primary};

          &:hover:not(:disabled) {
            color: ${theme.colors.primaryHover};
            text-decoration: underline;
          }
        `;
      case 'gray':
        return css`
          background-color: ${theme.colors.bgGray};
          color: ${theme.colors.textMain};

          &:hover:not(:disabled) {
            background-color: ${theme.colors.borderColor};
          }
        `;
      default:
        return css``;
    }
  }}

  ${({ size }) => {
    switch (size) {
      case 'sm':
        return css`
          padding: 0.35rem 0.9rem;
          font-size: 0.8rem;
        `;
      case 'md':
        return css`
          padding: 0.5rem 1.25rem;
          font-size: 0.875rem;
        `;
      case 'lg':
        return css`
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
        `;
      default:
        return css`
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        `;
    }
  }}
`;

function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) {
  return (
    <StyledButton variant={variant} size={size} className={className} {...props}>
      {children}
    </StyledButton>
  );
}

export default Button;

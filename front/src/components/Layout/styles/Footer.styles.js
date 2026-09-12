import styled from 'styled-components';
import { containerMax } from '../../../styles/mixins';

export const FooterWrapper = styled.footer`
  background-color: ${({ theme }) => theme.colors.bgGray};
  border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
  margin-top: 4rem;
  padding: 3rem 1.5rem 2rem;
`;

export const FooterInner = styled.div`
  ${containerMax}
`;

export const FooterContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

export const FooterSection = styled.div``;

export const FooterTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.textMain};
`;

export const FooterLink = styled.a`
  display: block;
  color: ${({ theme }) => theme.colors.textSub};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  margin-bottom: 0.5rem;
  text-decoration: none;
  transition: color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const FooterBottom = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
  padding-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

export const CompanyInfo = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const Copyright = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
`;

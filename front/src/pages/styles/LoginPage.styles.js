import styled from 'styled-components';

export const Container = styled.div`
  max-width: 440px;
  margin: 0 auto;
  padding: 48px 20px;
`;

export const Card = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 20px;
  padding: 2.5rem 2rem 2rem;
  box-shadow: ${({ theme }) => theme.shadows.light};
`;

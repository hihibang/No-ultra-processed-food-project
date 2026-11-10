import styled from 'styled-components';

export const RecipeQuestion = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSub};
  word-break: keep-all;
`;

export const RecipeDetails = styled.details`
  summary {
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
  }

  &[open] summary {
    margin-bottom: 0.5rem;
  }
`;

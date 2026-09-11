import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  /* Reset & Base Styles */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: ${theme.typography.fontFamily};
    background-color: ${theme.colors.white};
    color: ${theme.colors.textMain};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    user-select: none;
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    line-height: 1.2;
    font-weight: ${theme.typography.fontWeight.bold};
  }

  p {
    line-height: 1.6;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  /* Form Elements */
  button {
    font-family: inherit;
    border: none;
    background: none;
    cursor: pointer;
    transition: all 0.15s ease;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  input,
  select,
  textarea {
    font-family: inherit;
    font-size: inherit;
  }

  input,
  textarea {
    &:focus {
      outline: none;
    }
  }

  /* Utility Classes */
  .hidden {
    display: none !important;
  }

  /* Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.bgGray};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.borderColor};
    border-radius: ${theme.borderRadius.full};

    &:hover {
      background: ${theme.colors.textMuted};
    }
  }
`;

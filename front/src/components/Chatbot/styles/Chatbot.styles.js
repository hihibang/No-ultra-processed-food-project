import styled from 'styled-components';

export const Page = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.75rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textMain};
`;

export const PageDesc = styled.p`
  margin: 0.4rem 0 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSub};
`;

export const Layout = styled.div`
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Card = styled.section`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: ${({ theme }) => theme.shadows.light};
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
`;

export const CardTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textMain};
`;

export const TextButton = styled.button`
  background: none;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;

  &:hover {
    background: #ecfdf3;
  }
`;

export const FieldLabel = styled.p`
  margin: 1rem 0 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMain};
`;

export const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

export const TextInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 0.6rem 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 146, 69, 0.15);
  }
`;

export const HistoryList = styled.ul`
  list-style: none;
  margin: 0.75rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 320px;
  overflow-y: auto;
`;

export const HistoryItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

export const HistoryButton = styled.button`
  flex: 1;
  min-width: 0;
  text-align: left;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.borderColor)};
  background: ${({ $active }) => ($active ? '#ecfdf3' : '#fff')};
  font-family: inherit;
  cursor: pointer;
`;

export const HistoryTitle = styled.span`
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMain};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const HistoryMeta = styled.span`
  display: block;
  margin-top: 2px;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const DeleteButton = styled.button`
  background: none;
  border: none;
  padding: 0.25rem 0.4rem;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.error};
  }
`;

export const EmptyText = styled.p`
  margin: 0.75rem 0 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const ChatPanel = styled.section`
  display: flex;
  flex-direction: column;
  height: 680px;
  min-height: 480px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.light};

  @media (max-width: 900px) {
    height: 70vh;
  }
`;

export const MessageArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  background: ${({ theme }) => theme.colors.bgGray};
`;

export const WelcomeBox = styled.div`
  margin: auto;
  padding: 2rem 1rem;
  text-align: center;
  font-size: 0.92rem;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.textSub};
`;

export const Bubble = styled.div`
  align-self: ${({ $role }) => ($role === 'user' ? 'flex-end' : 'flex-start')};
  max-width: 82%;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  font-size: 0.92rem;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: keep-all;
  background: ${({ $role, theme }) => ($role === 'user' ? theme.colors.primary : theme.colors.white)};
  color: ${({ $role, theme }) => ($role === 'user' ? theme.colors.white : theme.colors.textMain)};
  border: ${({ $role, theme }) => ($role === 'user' ? 'none' : `1px solid ${theme.colors.borderColor}`)};
  box-shadow: ${({ theme }) => theme.shadows.light};
`;

export const BubbleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.3rem;
  font-size: 0.72rem;
  font-weight: 700;
  opacity: 0.75;
`;

export const KindTag = styled.span`
  padding: 0 0.45rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
  font-weight: 600;
`;

export const ErrorBanner = styled.div`
  align-self: stretch;
  padding: 0.7rem 0.9rem;
  border-radius: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.error};
`;

export const InputBar = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0.6rem;
  padding: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
  background: ${({ theme }) => theme.colors.white};
`;

export const TextArea = styled.textarea`
  flex: 1;
  resize: none;
  padding: 0.7rem 0.9rem;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.92rem;
  line-height: 1.5;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 146, 69, 0.15);
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.bgGray};
  }
`;

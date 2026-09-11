import { useState } from 'react';
import styled from 'styled-components';
import Button from '../Common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.heavy};
  color: ${({ theme }) => theme.colors.textMain};
  margin-bottom: 0.5rem;
  text-align: center;
`;

const FormSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.textSub};
  text-align: center;
  margin: 0;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.textMain};
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-family: inherit;
  transition: border-color 0.15s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 146, 69, 0.1);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const SwitchText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.textSub};
  text-align: center;
  margin: 1rem 0 0 0;
`;

const SwitchButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  cursor: pointer;
  font-family: inherit;
  text-decoration: underline;
  padding: 0;
  font-size: inherit;
`;

function LoginForm({ onSwitchToSignup }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      showToast('이메일과 비밀번호를 입력해주세요.', 'error');
      return;
    }

    setIsLoading(true);

    // 시뮬레이션
    setTimeout(() => {
      login(formData.email.split('@')[0]);
      showToast('로그인되었습니다!', 'success');
      setIsLoading(false);
    }, 800);
  };

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <div>
        <FormTitle>로그인</FormTitle>
        <FormSubtitle>계정에 로그인하세요</FormSubtitle>
      </div>

      <FormGroup>
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="example@email.com"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
        />
      </FormGroup>

      <ButtonGroup>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          style={{ flex: 1 }}
          disabled={isLoading}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>
      </ButtonGroup>

      <SwitchText>
        계정이 없으신가요?{' '}
        <SwitchButton type="button" onClick={onSwitchToSignup}>
          회원가입
        </SwitchButton>
      </SwitchText>
    </FormWrapper>
  );
}

export default LoginForm;

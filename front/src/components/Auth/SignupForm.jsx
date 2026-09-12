import { useState } from 'react';
import Button from '../Common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import {
  FormWrapper,
  FormTitle,
  FormSubtitle,
  FormGroup,
  Label,
  Input,
  Checkbox,
  CheckboxLabel,
  ButtonGroup,
  SwitchText,
  SwitchButton,
} from './styles/AuthForm.styles';

function SignupForm({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    agree: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const { showToast } = useToast();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.passwordConfirm) {
      showToast('모든 필드를 입력해주세요.', 'error');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      showToast('비밀번호가 일치하지 않습니다.', 'error');
      return;
    }

    if (!formData.agree) {
      showToast('이용약관에 동의해주세요.', 'error');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      signup(formData.name);
      showToast('회원가입되었습니다!', 'success');
      setIsLoading(false);
    }, 800);
  };

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <div>
        <FormTitle>회원가입</FormTitle>
        <FormSubtitle>새로운 계정을 만드세요</FormSubtitle>
      </div>

      <FormGroup>
        <Label htmlFor="name">이름</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="이름을 입력하세요"
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
        />
      </FormGroup>

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

      <FormGroup>
        <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
        <Input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          value={formData.passwordConfirm}
          onChange={handleChange}
          disabled={isLoading}
        />
      </FormGroup>

      <FormGroup>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            name="agree"
            checked={formData.agree}
            onChange={handleChange}
            disabled={isLoading}
          />
          <span>이용약관에 동의합니다</span>
        </CheckboxLabel>
      </FormGroup>

      <ButtonGroup>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          style={{ flex: 1 }}
          disabled={isLoading}
        >
          {isLoading ? '가입 중...' : '회원가입'}
        </Button>
      </ButtonGroup>

      <SwitchText>
        이미 계정이 있으신가요?{' '}
        <SwitchButton type="button" onClick={onSwitchToLogin}>
          로그인
        </SwitchButton>
      </SwitchText>
    </FormWrapper>
  );
}

export default SignupForm;

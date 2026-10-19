import { useState } from 'react';
import Button from '../Common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import {
  APPLIANCE_OPTIONS,
  PREFERENCE_OPTIONS,
  COOKING_LEVEL_OPTIONS,
} from '../../constants/userOptions';
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
  StepIndicator,
  StepDot,
  ErrorText,
  ChipSection,
  ChipGroup,
  Chip,
} from './styles/AuthForm.styles';

const API_BASE_URL = 'http://127.0.0.1:8000';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM = {
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
  agree: false,
  appliances: [],
  preferences: [],
  cooking_level: 'beginner',
};

function getSignupErrorMessage(status, detail) {
  if (status === 409) return '이미 가입된 이메일입니다. 로그인을 시도해 주세요.';
  if (status === 422) return '입력 내용을 다시 확인해 주세요.';
  if (detail) return detail;
  return '회원가입에 실패했습니다. 다시 시도해 주세요.';
}

function SignupForm({ onSwitchToLogin, onClose }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const toggleChip = (field, option) => {
    setFormData(prev => {
      const current = prev[field];
      const next = current.includes(option)
        ? current.filter(item => item !== option)
        : [...current, option];
      return { ...prev, [field]: next };
    });
  };

  const validateStep1 = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = '이름을 입력해주세요.';
    }
    if (!formData.email.trim()) {
      nextErrors.email = '이메일을 입력해주세요.';
    } else if (!EMAIL_PATTERN.test(formData.email)) {
      nextErrors.email = '이메일 형식이 올바르지 않습니다.';
    }
    if (!formData.password) {
      nextErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 8) {
      nextErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    } else if (new TextEncoder().encode(formData.password).length > 72) {
      nextErrors.password = '비밀번호는 72바이트 이하여야 합니다.';
    }
    if (formData.password !== formData.passwordConfirm) {
      nextErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }
    if (!formData.agree) {
      nextErrors.agree = '이용약관에 동의해주세요.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePrev = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          name: formData.name.trim(),
          appliances: formData.appliances,
          preferences: formData.preferences,
          cooking_level: formData.cooking_level,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const detail = typeof body.detail === 'string' ? body.detail : undefined;
        throw new Error(getSignupErrorMessage(response.status, detail));
      }

      const data = await response.json();
      const { access_token, user } = data;

      // 1. LocalStorage 저장
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_info', JSON.stringify(user));

      // 2. Cookie 저장
      document.cookie = `access_token=${access_token}; path=/; max-age=3600; SameSite=Lax`;

      // 3. AuthContext 로그인 상태 업데이트
      login(user);

      showToast(`반갑습니다, ${user.name}님! 회원가입 및 로그인이 완료되었습니다.`, 'success');
      setFormData(INITIAL_FORM);
      setStep(1);

      // 4. 모달 자동 닫기
      if (onClose) {
        onClose();
      }
    } catch (error) {
      if (error instanceof TypeError) {
        showToast('서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.', 'error');
      } else {
        showToast(error.message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
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
        {errors.name && <ErrorText>{errors.name}</ErrorText>}
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
        {errors.email && <ErrorText>{errors.email}</ErrorText>}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="8자 이상 입력하세요"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
        />
        {errors.password && <ErrorText>{errors.password}</ErrorText>}
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
        {errors.passwordConfirm && <ErrorText>{errors.passwordConfirm}</ErrorText>}
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
        {errors.agree && <ErrorText>{errors.agree}</ErrorText>}
      </FormGroup>

      <ButtonGroup>
        <Button
          type="button"
          variant="primary"
          size="lg"
          style={{ flex: 1 }}
          onClick={handleNext}
        >
          다음
        </Button>
      </ButtonGroup>
    </>
  );

  const renderStep2 = () => (
    <>
      <ChipSection>
        <Label>보유 주방기기</Label>
        <ChipGroup>
          {APPLIANCE_OPTIONS.map(option => (
            <Chip
              key={option}
              type="button"
              $active={formData.appliances.includes(option)}
              onClick={() => toggleChip('appliances', option)}
              disabled={isLoading}
            >
              {option}
            </Chip>
          ))}
        </ChipGroup>
      </ChipSection>

      <ChipSection>
        <Label>선호 요리 스타일</Label>
        <ChipGroup>
          {PREFERENCE_OPTIONS.map(option => (
            <Chip
              key={option}
              type="button"
              $active={formData.preferences.includes(option)}
              onClick={() => toggleChip('preferences', option)}
              disabled={isLoading}
            >
              {option}
            </Chip>
          ))}
        </ChipGroup>
      </ChipSection>

      <ChipSection>
        <Label>요리 숙련도</Label>
        <ChipGroup>
          {COOKING_LEVEL_OPTIONS.map(option => (
            <Chip
              key={option.value}
              type="button"
              $active={formData.cooking_level === option.value}
              onClick={() => setFormData(prev => ({ ...prev, cooking_level: option.value }))}
              disabled={isLoading}
            >
              {option.label}
            </Chip>
          ))}
        </ChipGroup>
      </ChipSection>

      <ButtonGroup>
        <Button
          type="button"
          variant="gray"
          size="lg"
          onClick={handlePrev}
          disabled={isLoading}
        >
          ← 이전
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          style={{ flex: 1 }}
          disabled={isLoading}
        >
          {isLoading ? '가입 중...' : '회원가입 완료'}
        </Button>
      </ButtonGroup>
    </>
  );

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <div>
        <FormTitle>회원가입</FormTitle>
        <FormSubtitle>새로운 계정을 만드세요</FormSubtitle>
      </div>

      <StepIndicator>
        <StepDot $active={step === 1}>1</StepDot>
        <span>기본 정보</span>
        <span>→</span>
        <StepDot $active={step === 2}>2</StepDot>
        <span>생활 환경</span>
      </StepIndicator>

      {step === 1 ? renderStep1() : renderStep2()}

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
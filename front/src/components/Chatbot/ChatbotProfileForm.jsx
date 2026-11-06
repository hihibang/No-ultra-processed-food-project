import { APPLIANCE_OPTIONS, COOKING_LEVEL_OPTIONS, PREFERENCE_OPTIONS } from '../../constants/userOptions';
import { Chip } from '../Auth/styles/AuthForm.styles';
import { ChipRow, FieldLabel, TextInput } from './styles/Chatbot.styles';

// 챗봇 요청에 함께 전송되는 취향/상태 입력 폼 (값은 부모가 관리)
function ChatbotProfileForm({ value, onChange }) {
  const toggleItem = (key, item) => {
    const current = value[key];
    const next = current.includes(item)
      ? current.filter(v => v !== item)
      : [...current, item];
    onChange({ ...value, [key]: next });
  };

  return (
    <div>
      <FieldLabel>요리 숙련도</FieldLabel>
      <ChipRow>
        {COOKING_LEVEL_OPTIONS.map(opt => (
          <Chip
            key={opt.value}
            type="button"
            $active={value.cookingLevel === opt.value}
            onClick={() => onChange({ ...value, cookingLevel: opt.value })}
          >
            {opt.label}
          </Chip>
        ))}
      </ChipRow>

      <FieldLabel>보유 주방 도구</FieldLabel>
      <ChipRow>
        {APPLIANCE_OPTIONS.map(item => (
          <Chip
            key={item}
            type="button"
            $active={value.appliances.includes(item)}
            onClick={() => toggleItem('appliances', item)}
          >
            {item}
          </Chip>
        ))}
      </ChipRow>

      <FieldLabel>선호 요리</FieldLabel>
      <ChipRow>
        {PREFERENCE_OPTIONS.map(item => (
          <Chip
            key={item}
            type="button"
            $active={value.preferences.includes(item)}
            onClick={() => toggleItem('preferences', item)}
          >
            {item}
          </Chip>
        ))}
      </ChipRow>

      <FieldLabel htmlFor="chatbot-restrictions">식이 제한 · 현재 상황</FieldLabel>
      <TextInput
        id="chatbot-restrictions"
        type="text"
        maxLength={200}
        placeholder="예: 땅콩 알레르기, 저염식, 20분 안에 만들기"
        value={value.restrictions}
        onChange={e => onChange({ ...value, restrictions: e.target.value })}
      />
    </div>
  );
}

export default ChatbotProfileForm;

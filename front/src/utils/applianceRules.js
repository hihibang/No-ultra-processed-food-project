// 조리도구 규칙: 내 취향 설정에서 체크하지 않은 도구는 '보유하지 않음'으로 본다.
// server/utils/chat_profile.py 의 find_appliance_violations 와 같은 규칙을 유지한다.
// 아무것도 체크하지 않았으면(설정 안 함) 제한하지 않는다.
import { APPLIANCE_OPTIONS } from '../constants/userOptions';

const STOVES = ['인덕션', '가스레인지'];
const HEAT_COOKING = new RegExp(
  '프라이팬|후라이팬|팬에|팬을|팬이|웍|냄비|가스\\s*불|가스레인지|인덕션|불을\\s*(켜|올)|약\\s*불|중\\s*불|센\\s*불|강\\s*불|중약\\s*불'
  + '|끓이|끓여|끓인|끓어|볶아|볶으|볶다|볶은\\s*(뒤|후)|튀기|튀겨|부치|지져|지지|삶아|삶은|굽다|구워',
  'g',
);
const NEGATION_AFTER = /^.{0,8}(없이|불가|대신|사용하지|쓰지|필요 ?없|필요하지)/;

export const findApplianceViolations = (text, appliances) => {
  const owned = Array.isArray(appliances) ? appliances : [];
  if (!text || owned.length === 0) return [];

  const found = [];
  if (!owned.some(name => STOVES.includes(name))) {
    found.push(...(text.match(HEAT_COOKING) ?? []));
  }
  APPLIANCE_OPTIONS.filter(name => !owned.includes(name)).forEach((name) => {
    let from = text.indexOf(name);
    while (from !== -1) {
      const after = text.slice(from + name.length, from + name.length + 12);
      if (!NEGATION_AFTER.test(after)) found.push(name);
      from = text.indexOf(name, from + name.length);
    }
  });
  return [...new Set(found)];
};

export const APPLIANCE_BLOCKED_MESSAGE =
  '현재 설정된 조리도구로 만들 수 있는 레시피를 찾지 못했어요. 다른 메뉴를 물어보거나 마이페이지에서 조리도구 설정을 확인해 주세요.';

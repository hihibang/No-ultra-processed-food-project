import { CriteriaFormula, CriteriaPanel } from './styles/ComparisonResultModal.styles';

// 건강 점수 산정 기준 안내. 수치는 server/utils/health_score.py, upf_classifier.py와 동일하게 유지한다.
function ScoreCriteriaPanel() {
  return (
    <CriteriaPanel>
      <h3>건강 점수 (100점 만점)</h3>
      <CriteriaFormula>100 − NOVA 감점 − UPF 마커 감점 − 영양 경고 감점 − 탄수화물 감점 (최저 0점)</CriteriaFormula>

      <h3>① NOVA 가공 등급 감점</h3>
      <ul>
        <li>1등급 자연/최소 가공: 0점 · 2등급 가공 식재료: −10점</li>
        <li>3등급 가공식품: −25점 · 4등급 초가공식품(UPF): −45점</li>
        <li>
          원재료의 첨가물 마커가 2개 이상이거나 마커·영양 점수 합이 4점 이상이면 4등급으로 판정하며,
          유탕면·탄산음료·빙과 등 일부 품목은 바로 4등급입니다.
        </li>
      </ul>

      <h3>② UPF 마커 감점</h3>
      <ul>
        <li>원재료에서 발견된 첨가물 마커 점수 합 × 5점을 감점합니다.</li>
        <li>3점: 첨가물 혼합제제 · 인공/대체 감미료 · 변성전분/쇼트닝 등 산업용 유지</li>
        <li>2점: 유화제/증점제 · 향미증진제/가공육 · 합성 색소 · 합성 향료</li>
      </ul>

      <h3>③ 영양 경고 감점</h3>
      <ul>
        <li>당류 15g 이상: −10점</li>
        <li>나트륨 800mg 이상: −10점</li>
        <li>포화지방 5g 이상: −5점</li>
      </ul>

      <h3>④ 탄수화물 감점</h3>
      <ul>
        <li>50g 이상: −5점 · 80g 이상: −10점</li>
      </ul>

      <p>영양 성분은 DB에 등록된 값을 그대로 사용합니다.</p>
    </CriteriaPanel>
  );
}

export default ScoreCriteriaPanel;

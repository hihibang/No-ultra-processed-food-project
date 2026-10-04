import {
  ChipContainer,
  NovaGradeChip,
  BadgesContainer,
  Badge,
  ShefNoteContainer,
  ShefNoteText,
} from './styles/NovaAnalysisChip.styles';

const NOVA_COLORS = {
  1: '#4CAF50',
  2: '#FFC107',
  3: '#FF9800',
  4: '#F44336',
};

const NOVA_LABELS = {
  1: '미가공식품',
  2: '최소가공',
  3: '가공식품',
  4: '초가공식품',
};

function NovaAnalysisChip({ novaGrade, badges = [], shefNote = '' }) {
  const gradeColor = NOVA_COLORS[novaGrade] || '#999';
  const gradeLabel = NOVA_LABELS[novaGrade] || '정보 없음';

  return (
    <ChipContainer>
      <NovaGradeChip $color={gradeColor}>
        <span className="label">NOVA</span>
        <span className="grade">{novaGrade}</span>
        <span className="text">{gradeLabel}</span>
      </NovaGradeChip>

      {badges.length > 0 && (
        <BadgesContainer>
          {badges.map((badge, idx) => (
            <Badge key={idx} $badgeType={badge.type}>
              {badge.icon && <span className="icon">{badge.icon}</span>}
              <span>{badge.label}</span>
            </Badge>
          ))}
        </BadgesContainer>
      )}

      {shefNote && (
        <ShefNoteContainer>
          <ShefNoteText>
            <span className="title">🤖 AI 셰프 노트:</span>
            <span className="note">{shefNote}</span>
          </ShefNoteText>
        </ShefNoteContainer>
      )}
    </ChipContainer>
  );
}

export default NovaAnalysisChip;

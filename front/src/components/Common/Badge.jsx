import { StyledBadge } from './styles/Badge.styles';

function Badge({ label, type = 'default', isRed = false }) {
  return (
    <StyledBadge type={type} isRed={isRed}>
      {label}
    </StyledBadge>
  );
}

export default Badge;

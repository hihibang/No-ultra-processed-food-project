import { StyledButton } from './styles/Button.styles';

function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) {
  return (
    <StyledButton variant={variant} size={size} className={className} {...props}>
      {children}
    </StyledButton>
  );
}

export default Button;

import { CardWrapper, IconWrapper, CategoryTitle, CategorySubtitle } from './styles/CategoryCard.styles';

function CategoryCard({ icon, title, subtitle, onClick }) {
  return (
    <CardWrapper onClick={onClick}>
      <IconWrapper>{icon}</IconWrapper>
      <CategoryTitle>{title}</CategoryTitle>
      {subtitle && <CategorySubtitle>{subtitle}</CategorySubtitle>}
    </CardWrapper>
  );
}

export default CategoryCard;
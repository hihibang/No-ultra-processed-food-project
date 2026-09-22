import { CardContainer, ImageWrapper, CategoryTag, ReadTime, Content, Title, Summary, ProductChips, ProductChip } from './JournalCard.styles';

function JournalCard({ data, onClick }) {
  return (
    <CardContainer onClick={onClick}>
      <ImageWrapper>
        <img src={data.thumbnail} alt={data.title} />
        <CategoryTag>{data.category}</CategoryTag>
        <ReadTime>{data.readTime}</ReadTime>
      </ImageWrapper>
      <Content>
        <Title>{data.title}</Title>
        <Summary>{data.summary}</Summary>
        {data.relatedProducts && data.relatedProducts.length > 0 && (
          <ProductChips>
            {data.relatedProducts.slice(0, 2).map((product) => (
              <ProductChip key={product.id}>{product.name}</ProductChip>
            ))}
          </ProductChips>
        )}
      </Content>
    </CardContainer>
  );
}

export default JournalCard;

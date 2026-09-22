import { CardContainer, ImageWrapper, CategoryTag, Content, ReadTime, Title, Summary, ProductInfo } from './JournalCard.styles';

function JournalCard({ data, onClick }) {
  return (
    <CardContainer onClick={onClick}>
      <ImageWrapper>
        <img src={data.thumbnail} alt={data.title} />
        <CategoryTag>{data.category}</CategoryTag>
      </ImageWrapper>
      <Content>
        <ReadTime>{data.readTime}</ReadTime>
        <Title>{data.title}</Title>
        <Summary>{data.summary}</Summary>
        {data.relatedProducts && data.relatedProducts.length > 0 && (
          <ProductInfo>
            관련 제품 {data.relatedProducts[0].name}
          </ProductInfo>
        )}
      </Content>
    </CardContainer>
  );
}

export default JournalCard;

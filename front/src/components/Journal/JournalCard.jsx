import {
  CardContainer,
  ImageWrapper,
  CategoryTag,
  Content,
  ReadTime,
  Title,
  Summary,
  ProductInfo,
} from './JournalCard.styles';

function JournalCard({ data, onClick }) {
  return (
    <CardContainer onClick={onClick}>
      <ImageWrapper>
        {data.thumbnail && <img src={data.thumbnail} alt={data.title} />}
        <CategoryTag>{data.category}</CategoryTag>
      </ImageWrapper>
      <Content>
        <ReadTime>{data.readTime}</ReadTime>
        <Title>{data.title}</Title>
        <Summary>{data.summary}</Summary>
        {data.relatedProducts && data.relatedProducts.length > 0 && (
          <ProductInfo>
            <span style={{ color: '#059669', fontWeight: 700 }}>관련 제품</span>
            <span>{data.relatedProducts[0].name}</span>
          </ProductInfo>
        )}
      </Content>
    </CardContainer>
  );
}

export default JournalCard;
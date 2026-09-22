import { Overlay, ModalContainer, Header, CloseButton, Title, Meta, MetaItem, Content, Body, ProductsSection, ProductTitle, ProductList, ProductItem } from './JournalDetailModal.styles';

function JournalDetailModal({ data, onClose }) {
  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>{data.title}</Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>
        <Meta>
          <MetaItem>{data.category}</MetaItem>
          <MetaItem>{data.readTime}</MetaItem>
          <MetaItem>{new Date(data.createdAt).toLocaleDateString('ko-KR')}</MetaItem>
        </Meta>
        <Content>
          <Body>{data.content}</Body>
          {data.relatedProducts && data.relatedProducts.length > 0 && (
            <ProductsSection>
              <ProductTitle>연관 추천 상품</ProductTitle>
              <ProductList>
                {data.relatedProducts.map((product) => (
                  <ProductItem key={product.id}>{product.name}</ProductItem>
                ))}
              </ProductList>
            </ProductsSection>
          )}
        </Content>
      </ModalContainer>
    </Overlay>
  );
}

export default JournalDetailModal;

import {
  FooterWrapper,
  FooterInner,
  FooterContent,
  FooterSection,
  FooterTitle,
  FooterLink,
  FooterBottom,
  CompanyInfo,
  Copyright,
} from './styles/Footer.styles';

function Footer() {
  return (
    <FooterWrapper>
      <FooterInner>
        <FooterContent>
          <FooterSection>
            <FooterTitle>회사</FooterTitle>
            <FooterLink href="#about">회사 소개</FooterLink>
            <FooterLink href="#careers">채용정보</FooterLink>
            <FooterLink href="#press">보도자료</FooterLink>
            <FooterLink href="#blog">블로그</FooterLink>
          </FooterSection>

          <FooterSection>
            <FooterTitle>고객 지원</FooterTitle>
            <FooterLink href="#faq">자주 묻는 질문</FooterLink>
            <FooterLink href="#contact">고객 지원</FooterLink>
            <FooterLink href="#shipping">배송 안내</FooterLink>
            <FooterLink href="#returns">반품 정책</FooterLink>
          </FooterSection>

          <FooterSection>
            <FooterTitle>약관</FooterTitle>
            <FooterLink href="#terms">이용약관</FooterLink>
            <FooterLink href="#privacy">개인정보 처리방침</FooterLink>
            <FooterLink href="#cookies">쿠키 정책</FooterLink>
            <FooterLink href="#accessibility">접근성</FooterLink>
          </FooterSection>

          <FooterSection>
            <FooterTitle>팔로우</FooterTitle>
            <FooterLink href="#facebook">Facebook</FooterLink>
            <FooterLink href="#instagram">Instagram</FooterLink>
            <FooterLink href="#twitter">Twitter</FooterLink>
            <FooterLink href="#youtube">YouTube</FooterLink>
          </FooterSection>
        </FooterContent>

        <FooterBottom>
          <CompanyInfo>
            <p>서비스 제목 | 성분 중심의 건강한 식품 마켓</p>
            <p>Tel: 1234-5678 | Email: support@example.com</p>
          </CompanyInfo>
          <Copyright>
            © 2024 Health Food Market. All rights reserved.
          </Copyright>
        </FooterBottom>
      </FooterInner>
    </FooterWrapper>
  );
}

export default Footer;

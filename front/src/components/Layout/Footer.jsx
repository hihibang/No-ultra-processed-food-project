import styled from 'styled-components';
import { containerMax } from '../../styles/mixins';

const FooterWrapper = styled.footer`
  background-color: ${({ theme }) => theme.colors.bgGray};
  border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
  margin-top: 4rem;
  padding: 3rem 1.5rem 2rem;
`;

const FooterInner = styled.div`
  ${containerMax}
`;

const FooterContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const FooterSection = styled.div``;

const FooterTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.textMain};
`;

const FooterLink = styled.a`
  display: block;
  color: ${({ theme }) => theme.colors.textSub};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  margin-bottom: 0.5rem;
  text-decoration: none;
  transition: color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
  padding-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const CompanyInfo = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Copyright = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
`;

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

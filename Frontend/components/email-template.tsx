import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';

interface EmailTemplateProps {
  firstName: string;
  verificationToken: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
  verificationToken,
}) => {
  const verifyLink = `http://localhost:3000/verify-email?token=${verificationToken}`;

  return (
    <Html>
      <Head />
      <Preview>Xác thực địa chỉ email của bạn tại FruiTaste</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>FruiTaste 🍏</Heading>
          <Text style={text}>Xin chào {firstName},</Text>
          <Text style={text}>
            Cảm ơn bạn đã tham gia cộng đồng FruiTaste! Để hoàn tất việc đăng ký và bảo mật tài khoản của bạn, vui lòng xác thực địa chỉ email bằng cách nhấn vào nút bên dưới:
          </Text>
          <Section style={buttonContainer}>
            <Button
              style={button}
              href={verifyLink}
            >
              Xác thực Email
            </Button>
          </Section>
          <Text style={text}>
            Liên kết này sẽ an toàn đưa bạn về trang xác nhận của FruiTaste. Nếu bạn không tạo tài khoản, bạn có thể bỏ qua email này một cách an toàn.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            Trân trọng,<br />Đội ngũ FruiTaste
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  padding: '40px 0',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e6ebf1',
  borderRadius: '8px',
  padding: '40px',
  maxWidth: '600px',
  margin: '0 auto',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
};

const h1 = {
  color: '#16a34a',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0 0 24px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 20px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#16a34a',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0 24px',
};

const footer = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '24px',
};

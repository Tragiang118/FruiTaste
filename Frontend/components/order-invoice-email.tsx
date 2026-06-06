import * as React from 'react';
import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Html,
  Preview,
  Row,
  Section,
  Text,
  Hr,
  Link,
} from '@react-email/components';

interface OrderItem {
  productId: number;
  quantity: number;
  priceAtPurchase: number;
  product?: {
    name: string;
    imageUrl?: string;
  };
}

interface OrderInvoiceEmailProps {
  firstName: string;
  orderId: number;
  createdAt: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  items: OrderItem[];
  totalAmount: number;
  shippingFee: number;
  finalAmount: number;
}

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const OrderInvoiceEmail: React.FC<Readonly<OrderInvoiceEmailProps>> = ({
  firstName,
  orderId,
  createdAt,
  shippingName,
  shippingPhone,
  shippingAddress,
  paymentMethod,
  items,
  totalAmount,
  shippingFee,
  finalAmount,
}) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>🍏 FruiTaste</Heading>
            <Text style={headerSubtitle}>Trái cây tươi ngon mỗi ngày</Text>
          </Section>

          {/* Hero */}
          <Section style={hero}>
            <Text style={heroIcon}>🎉</Text>
            <Heading style={heroTitle}>Đặt hàng thành công!</Heading>
            <Text style={heroText}>
              Xin chào <strong>{shippingName}</strong>, đơn hàng của bạn đã được xác nhận.
              Chúng tôi sẽ chuẩn bị và giao hàng sớm nhất có thể!
            </Text>
          </Section>

          {/* Order Info */}
          <Section style={infoBox}>
            <Row>
              <Column style={infoCell}>
                <Text style={infoLabel}>Mã đơn hàng</Text>
                <Text style={infoValue}>#{orderId}</Text>
              </Column>
              <Column style={infoCell}>
                <Text style={infoLabel}>Ngày đặt</Text>
                <Text style={infoValue}>{formatDate(createdAt)}</Text>
              </Column>
              <Column style={infoCell}>
                <Text style={infoLabel}>Thanh toán</Text>
                <Text style={infoValue}>
                  {paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt (COD)'}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Shipping Info */}
          <Section style={shippingBox}>
            <Heading style={sectionTitle}>📦 Thông tin giao hàng</Heading>
            <Text style={shippingText}><strong>Người nhận:</strong> {shippingName}</Text>
            <Text style={shippingText}><strong>Số điện thoại:</strong> {shippingPhone}</Text>
            <Text style={shippingText}><strong>Địa chỉ:</strong> {shippingAddress}</Text>
          </Section>

          {/* Products */}
          <Section style={section}>
            <Heading style={sectionTitle}>🛒 Sản phẩm đã đặt</Heading>
            <Hr style={divider} />

            {items.map((item, index) => (
              <Row key={index} style={productRow}>
                <Column style={{ width: '60%' }}>
                  <Text style={productName}>
                    {item.product?.name || `Sản phẩm #${item.productId}`}
                  </Text>
                  <Text style={productMeta}>Số lượng: {item.quantity}</Text>
                  <Text style={productMeta}>
                    {formatVND(item.priceAtPurchase)} / sản phẩm
                  </Text>
                </Column>
                <Column style={{ width: '20%', textAlign: 'center' as const }}>
                  <Text style={productMeta}>x{item.quantity}</Text>
                </Column>
                <Column style={{ width: '20%', textAlign: 'right' as const }}>
                  <Text style={productTotal}>
                    {formatVND(item.priceAtPurchase * item.quantity)}
                  </Text>
                </Column>
              </Row>
            ))}

            <Hr style={divider} />

            {/* Totals */}
            <Row style={totalRow}>
              <Column style={{ width: '70%' }}>
                <Text style={totalLabel}>Tạm tính</Text>
              </Column>
              <Column style={{ width: '30%', textAlign: 'right' as const }}>
                <Text style={totalValue}>{formatVND(totalAmount)}</Text>
              </Column>
            </Row>
            <Row style={totalRow}>
              <Column style={{ width: '70%' }}>
                <Text style={totalLabel}>Phí vận chuyển</Text>
              </Column>
              <Column style={{ width: '30%', textAlign: 'right' as const }}>
                <Text style={totalValue}>
                  {shippingFee === 0 ? 'Miễn phí' : formatVND(shippingFee)}
                </Text>
              </Column>
            </Row>
            <Hr style={divider} />
            <Row style={totalRow}>
              <Column style={{ width: '70%' }}>
                <Text style={grandTotalLabel}>TỔNG CỘNG</Text>
              </Column>
              <Column style={{ width: '30%', textAlign: 'right' as const }}>
                <Text style={grandTotalValue}>{formatVND(finalAmount)}</Text>
              </Column>
            </Row>
          </Section>

          {/* CTA */}
          <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
            <Link
              href={`http://localhost:3000/orders/${orderId}`}
              style={ctaButton}
            >
              Xem đơn hàng của tôi
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              Nếu có bất kỳ thắc mắc nào, hãy liên hệ với chúng tôi qua email{' '}
              <Link href="mailto:support@fruitaste.page" style={{ color: '#16a34a' }}>
                support@fruitaste.page
              </Link>
            </Text>
            <Text style={footerText}>
              Trân trọng,<br />
              <strong>Đội ngũ FruiTaste 🍏</strong>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const main = {
  backgroundColor: '#f0fdf4',
  padding: '40px 0',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #d1fae5',
  borderRadius: '16px',
  maxWidth: '620px',
  margin: '0 auto',
  overflow: 'hidden',
  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
};

const header = {
  backgroundColor: '#16a34a',
  padding: '28px 40px',
  textAlign: 'center' as const,
};

const logo = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '900',
  margin: '0',
  letterSpacing: '-0.5px',
};

const headerSubtitle = {
  color: '#bbf7d0',
  fontSize: '13px',
  margin: '6px 0 0',
};

const hero = {
  padding: '32px 40px 24px',
  textAlign: 'center' as const,
};

const heroIcon = {
  fontSize: '48px',
  margin: '0 0 8px',
};

const heroTitle = {
  color: '#15803d',
  fontSize: '26px',
  fontWeight: '900',
  margin: '0 0 12px',
};

const heroText = {
  color: '#4b5563',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
};

const infoBox = {
  backgroundColor: '#f0fdf4',
  borderTop: '1px solid #d1fae5',
  borderBottom: '1px solid #d1fae5',
  padding: '20px 40px',
};

const infoCell = {
  textAlign: 'center' as const,
  padding: '0 8px',
};

const infoLabel = {
  color: '#9ca3af',
  fontSize: '11px',
  fontWeight: '700',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  margin: '0 0 4px',
};

const infoValue = {
  color: '#111827',
  fontSize: '14px',
  fontWeight: '700',
  margin: '0',
};

const section = {
  padding: '28px 40px',
};

const sectionTitle = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: '800',
  margin: '0 0 16px',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '12px 0',
};

const productRow = {
  padding: '10px 0',
  borderBottom: '1px solid #f3f4f6',
};

const productName = {
  color: '#111827',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 2px',
};

const productMeta = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '0',
};

const productTotal = {
  color: '#111827',
  fontSize: '14px',
  fontWeight: '700',
  margin: '0',
};

const totalRow = {
  padding: '5px 0',
};

const totalLabel = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};

const totalValue = {
  color: '#374151',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const grandTotalLabel = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: '900',
  margin: '0',
};

const grandTotalValue = {
  color: '#16a34a',
  fontSize: '20px',
  fontWeight: '900',
  margin: '0',
};

const shippingBox = {
  backgroundColor: '#fafafa',
  borderTop: '1px solid #f3f4f6',
  padding: '24px 40px',
};

const shippingText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 6px',
};

const ctaButton = {
  backgroundColor: '#16a34a',
  borderRadius: '50px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '700',
  textDecoration: 'none',
  display: 'inline-block',
  padding: '14px 32px',
};

const footerSection = {
  padding: '20px 40px 32px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#9ca3af',
  fontSize: '13px',
  lineHeight: '22px',
  margin: '0 0 8px',
};

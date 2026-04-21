import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface ReceiptItem {
  quantity: number;
  name: string;
  price: number;
}

interface ReceiptEmailProps {
  orderNumber: string;
  customerName: string;
  items: ReceiptItem[];
  total: number;
  date: string;
}

export const ReceiptEmail = ({
  orderNumber = "ABC12345",
  customerName = "Cliente",
  items = [],
  total = 0,
  date = new Date().toLocaleDateString('es-MX'),
}: ReceiptEmailProps) => {
  const previewText = `Comprobante de compra Don Galleta - Orden #${orderNumber}`;
  const subtotal = total / 1.16;
  const iva = total - subtotal;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>🍪 Don Galleta S.A. de C.V.</Heading>
            <Text style={companyInfo}>
              RFC: DGA260305XXX<br />
              Acatlima, Huajuapan de León<br />
              Oaxaca, México. C.P. 69004<br />
              Tel: (951) 555-0123
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Receipt Title */}
          <Section style={receiptHeader}>
            <Heading style={h2}>COMPROBANTE DE COMPRA</Heading>
          </Section>

          {/* Order Details */}
          <Section style={orderDetails}>
            <Row>
              <Column style={labelColumn}><Text style={label}>ORDEN BD:</Text></Column>
              <Column style={valueColumn}><Text style={value}>#{orderNumber}</Text></Column>
            </Row>
            <Row>
              <Column style={labelColumn}><Text style={label}>FECHA:</Text></Column>
              <Column style={valueColumn}><Text style={value}>{date}</Text></Column>
            </Row>
            <Row>
              <Column style={labelColumn}><Text style={label}>CLIENTE:</Text></Column>
              <Column style={valueColumn}><Text style={value}>{customerName}</Text></Column>
            </Row>
            <Row>
              <Column style={labelColumn}><Text style={label}>MÉTODO:</Text></Column>
              <Column style={valueColumn}><Text style={value}>Stripe</Text></Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Products Table */}
          <Section style={productsSection}>
            <Row style={tableHeader}>
              <Column style={quantityColumn}><Text style={tableHeaderText}>CANT</Text></Column>
              <Column style={productColumn}><Text style={tableHeaderText}>ARTÍCULO</Text></Column>
              <Column style={priceColumn}><Text style={tableHeaderText}>P.U.</Text></Column>
              <Column style={totalColumn}><Text style={tableHeaderText}>TOTAL</Text></Column>
            </Row>
            {items.map((item, index) => (
              <Row key={index} style={tableRow}>
                <Column style={quantityColumn}><Text style={tableText}>{item.quantity}x</Text></Column>
                <Column style={productColumn}><Text style={tableText}>{item.name}</Text></Column>
                <Column style={priceColumn}><Text style={tableText}>${item.price.toFixed(2)}</Text></Column>
                <Column style={totalColumn}><Text style={tableText}>${(item.price * item.quantity).toFixed(2)}</Text></Column>
              </Row>
            ))}
          </Section>

          <Hr style={hr} />

          {/* Totals */}
          <Section style={totalsSection}>
            <Row>
              <Column style={totalLabelColumn}><Text style={totalLabel}>SUBTOTAL:</Text></Column>
              <Column style={totalValueColumn}><Text style={totalValue}>${subtotal.toFixed(2)}</Text></Column>
            </Row>
            <Row>
              <Column style={totalLabelColumn}><Text style={totalLabel}>IVA (16%):</Text></Column>
              <Column style={totalValueColumn}><Text style={totalValue}>${iva.toFixed(2)}</Text></Column>
            </Row>
            <Row style={finalTotal}>
              <Column style={totalLabelColumn}><Text style={finalTotalText}>TOTAL MXN:</Text></Column>
              <Column style={totalValueColumn}><Text style={finalTotalText}>${total.toFixed(2)}</Text></Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={thankYouText}>¡GRACIAS POR TU COMPRA!</Text>
            <Text style={footerInfo}>
              Dudas o aclaraciones: hola@dongalleta.com<br />
              Este documento no es un comprobante fiscal.<br />
              <br />
              Más productos en dongalleta.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ReceiptEmail;

// Estilos CSS-in-JS
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '20px 30px',
  textAlign: 'center' as const,
  backgroundColor: '#8B4513',
  color: '#ffffff',
};

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 10px',
  textAlign: 'center' as const,
};

const companyInfo = {
  color: '#ffffff',
  fontSize: '12px',
  lineHeight: '1.4',
  margin: '0',
  textAlign: 'center' as const,
};

const receiptHeader = {
  padding: '20px 30px 10px',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
};

const orderDetails = {
  padding: '0 30px',
};

const labelColumn = { width: '30%' };
const valueColumn = { width: '70%' };

const label = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: 'bold',
  margin: '5px 0',
};

const value = {
  color: '#1f2937',
  fontSize: '12px',
  margin: '5px 0',
  fontWeight: 'bold',
};

const productsSection = {
  padding: '0 30px',
};

const tableHeader = {
  backgroundColor: '#f3f4f6',
};

const quantityColumn = { width: '15%' };
const productColumn = { width: '40%' };
const priceColumn = { width: '22.5%' };
const totalColumn = { width: '22.5%' };

const tableHeaderText = {
  color: '#1f2937',
  fontSize: '11px',
  fontWeight: 'bold',
  margin: '8px 0',
  padding: '0 5px',
};

const tableRow = {
  borderBottom: '1px solid #e5e7eb',
};

const tableText = {
  color: '#374151',
  fontSize: '11px',
  margin: '8px 0',
  padding: '0 5px',
};

const totalsSection = {
  padding: '0 30px',
};

const totalLabelColumn = { width: '70%', textAlign: 'right' as const };
const totalValueColumn = { width: '30%', textAlign: 'right' as const };

const totalLabel = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '5px 0',
  padding: '0 10px',
};

const totalValue = {
  color: '#1f2937',
  fontSize: '12px',
  margin: '5px 0',
  padding: '0 10px',
};

const finalTotal = {
  backgroundColor: '#f9fafb',
  borderTop: '2px solid #1f2937',
  borderBottom: '2px solid #1f2937',
};

const finalTotalText = {
  color: '#1f2937',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '10px 0',
  padding: '0 10px',
};

const footer = {
  padding: '20px 30px',
  textAlign: 'center' as const,
};

const thankYouText = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 15px',
};

const footerInfo = {
  color: '#6b7280',
  fontSize: '11px',
  lineHeight: '1.5',
  margin: '0',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '10px 0',
};
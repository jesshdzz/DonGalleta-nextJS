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
} from '@react-email/components';
import * as React from 'react';

interface LowStockEmailProps {
  productId: number;
  productName: string;
  currentStock: number;
}

export const LowStockEmail = ({
  productId,
  productName = "Producto DonGalleta",
  currentStock = 0,
}: LowStockEmailProps) => {
  const previewText = `Stock bajo: ${productName} (${currentStock} unidades restantes)`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>⚠️ Stock Bajo</Heading>
          </Section>
          
          {/* Alert Box */}
          <Section style={alertBox}>
            <Text style={alertText}>
              ¡Atención Administrador!
            </Text>
          </Section>

          {/* Product Details */}
          <Section style={content}>
            <Text style={description}>
              El siguiente producto ha alcanzado un nivel de stock bajo y requiere reabastecimiento:
            </Text>
            
            <Section style={productCard}>
              <Row>
                <Column style={labelColumn}>
                  <Text style={label}>ID del Producto:</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={value}>#{productId}</Text>
                </Column>
              </Row>
              
              <Row>
                <Column style={labelColumn}>
                  <Text style={label}>Nombre:</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={value}>{productName}</Text>
                </Column>
              </Row>
              
              <Row>
                <Column style={labelColumn}>
                  <Text style={label}>Cantidad restante:</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={{...value, color: '#f59e0b', fontWeight: 'bold'}}>
                    {currentStock} unidades
                  </Text>
                </Column>
              </Row>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Este es un mensaje automático del sistema DonGalleta.
            </Text>
            <Text style={footerText}>
              Por favor, considera reabastecer el inventario para evitar quedarse sin stock.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Estilos
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  padding: '45px',
  borderRadius: '8px',
  margin: '40px auto',
  maxWidth: '600px',
};

const header = {
  textAlign: 'center' as const,
  marginBottom: '30px',
};

const h1 = {
  color: '#f59e0b',
  fontSize: '28px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
};

const alertBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '6px',
  padding: '20px',
  textAlign: 'center' as const,
  marginBottom: '30px',
};

const alertText = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const content = {
  marginBottom: '30px',
};

const description = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '20px',
};

const productCard = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '20px',
  marginBottom: '20px',
};

const labelColumn = {
  width: '40%',
  paddingRight: '10px',
};

const valueColumn = {
  width: '60%',
};

const label = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 8px 0',
};

const value = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const footer = {
  borderTop: '1px solid #e5e7eb',
  paddingTop: '20px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 10px 0',
};

export default LowStockEmail;
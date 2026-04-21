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

interface OutOfStockEmailProps {
  productId: number;
  productName: string;
}

const OutOfStockEmail = ({
  productId,
  productName = "Producto DonGalleta",
}: OutOfStockEmailProps) => {
  const previewText = `AGOTADO: ${productName} - Reabastecimiento urgente requerido`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>🚨 PRODUCTO AGOTADO</Heading>
          </Section>
          
          {/* Alert Box */}
          <Section style={alertBox}>
            <Text style={alertText}>
              ¡ACCIÓN INMEDIATA REQUERIDA!
            </Text>
          </Section>

          {/* Product Details */}
          <Section style={content}>
            <Text style={description}>
              El siguiente producto se ha quedado completamente sin stock y requiere reabastecimiento urgente:
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
                  <Text style={{...value, color: '#dc2626', fontWeight: 'bold', fontSize: '18px'}}>
                    0 unidades
                  </Text>
                </Column>
              </Row>
              
              <Row>
                <Column style={labelColumn}>
                  <Text style={label}>Estado:</Text>
                </Column>
                <Column style={valueColumn}>
                  <Section style={statusBadge}>
                    <Text style={statusText}>AGOTADO</Text>
                  </Section>
                </Column>
              </Row>
            </Section>
          </Section>

          {/* Action Required */}
          <Section style={actionSection}>
            <Text style={actionTitle}>Acciones requeridas:</Text>
            <Text style={actionItem}>• Contactar proveedores para reabastecimiento</Text>
            <Text style={actionItem}>• Actualizar el sistema de inventario</Text>
            <Text style={actionItem}>• Considerar actualizar la disponibilidad en el sitio web</Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Este es un mensaje automático del sistema DonGalleta.
            </Text>
            <Text style={footerText}>
              El producto no estará disponible para venta hasta que se reabastezca el inventario.
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
  color: '#dc2626',
  fontSize: '28px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
};

const alertBox = {
  backgroundColor: '#fee2e2',
  border: '1px solid #dc2626',
  borderRadius: '6px',
  padding: '20px',
  textAlign: 'center' as const,
  marginBottom: '30px',
};

const alertText = {
  color: '#991b1b',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0',
  textTransform: 'uppercase' as const,
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

const statusBadge = {
  backgroundColor: '#dc2626',
  borderRadius: '4px',
  padding: '4px 8px',
  display: 'inline-block',
};

const statusText = {
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: '700',
  margin: '0',
  textTransform: 'uppercase' as const,
};

const actionSection = {
  backgroundColor: '#fffbeb',
  border: '1px solid #f59e0b',
  borderRadius: '6px',
  padding: '20px',
  marginBottom: '30px',
};

const actionTitle = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 15px 0',
};

const actionItem = {
  color: '#78350f',
  fontSize: '14px',
  lineHeight: '20px',
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

export default OutOfStockEmail;
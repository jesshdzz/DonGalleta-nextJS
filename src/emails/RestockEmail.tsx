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
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';

interface RestockEmailProps {
  userName: string;
  productName: string;
  productId: number;
  currentStock: number;
  price: string;
  productUrl?: string;
}

export const RestockEmail = ({
  userName = "Cliente",
  productName = "Producto DonGalleta",
  productId,
  currentStock = 0,
  price = "0.00",
  productUrl = `https://dongalleta.com/productos/${productId}`,
}: RestockEmailProps) => {
  const previewText = `${productName} está disponible de nuevo en DonGalleta`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Buenas noticias</Heading>
          </Section>
          
          {/* Alert Box */}
          <Section style={alertBox}>
            <Text style={alertText}>
              El producto que esperabas está disponible de nuevo
            </Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={greeting}>
              Hola {userName},
            </Text>
            
            <Text style={description}>
              Te informamos que <strong>{productName}</strong> ha sido reabastecido y ahora está disponible para compra en nuestra tienda.
            </Text>
            
            {/* Product Details */}
            <Section style={productCard}>
              <Row>
                <Column style={labelColumn}>
                  <Text style={label}>Producto:</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={value}>{productName}</Text>
                </Column>
              </Row>
              
              <Row>
                <Column style={labelColumn}>
                  <Text style={label}>Stock disponible:</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={{...value, color: '#16a34a', fontWeight: 'bold'}}>
                    {currentStock} unidades
                  </Text>
                </Column>
              </Row>
              
              <Row>
                <Column style={labelColumn}>
                  <Text style={label}>Precio:</Text>
                </Column>
                <Column style={valueColumn}>
                  <Text style={value}>${price}</Text>
                </Column>
              </Row>
            </Section>

            <Text style={urgencyText}>
              No dejes pasar esta oportunidad, el stock es limitado y podría agotarse pronto.
            </Text>

            {/* CTA Button */}
            <Section style={btnContainer}>
              <Button style={button} href={productUrl}>
                Ver producto
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Recibiste este correo porque te suscribiste a notificaciones de reabastecimiento para este producto.
            </Text>
            <Text style={footerText}>
              DonGalleta - Las mejores galletas artesanales
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default RestockEmail;

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
  color: '#16a34a',
  fontSize: '28px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
};

const alertBox = {
  backgroundColor: '#dcfce7',
  border: '1px solid #16a34a',
  borderRadius: '6px',
  padding: '20px',
  textAlign: 'center' as const,
  marginBottom: '30px',
};

const alertText = {
  color: '#14532d',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const content = {
  marginBottom: '30px',
};

const greeting = {
  color: '#111827',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
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
  fontWeight: '500',
  margin: '0 0 8px 0',
};

const urgencyText = {
  color: '#ea580c',
  fontSize: '14px',
  lineHeight: '20px',
  marginBottom: '24px',
  fontStyle: 'italic',
};

const btnContainer = {
  textAlign: 'center' as const,
  marginBottom: '30px',
};

const button = {
  backgroundColor: '#16a34a',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
  cursor: 'pointer',
};

const footer = {
  borderTop: '1px solid #e5e7eb',
  paddingTop: '20px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0 0 8px 0',
};

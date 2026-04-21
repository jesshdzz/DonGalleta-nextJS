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
} from '@react-email/components';
import * as React from 'react';

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
}

const PasswordResetEmail = ({
  userName = 'Usuario',
  resetUrl = '#',
}: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Restablece tu contraseña de DonGalleta</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Restablecer Contraseña</Heading>
          </Section>

          {/* Body */}
          <Section style={content}>
            <Text style={greeting}>Hola, {userName}</Text>
            <Text style={paragraph}>
              Recibimos una solicitud para restablecer la contraseña de tu cuenta en{' '}
              <strong>DonGalleta</strong>. Si no realizaste esta solicitud, puedes ignorar
              este correo de forma segura.
            </Text>
            <Text style={paragraph}>
              Este enlace es válido por <strong>1 hora</strong>.
            </Text>
          </Section>

          {/* CTA */}
          <Section style={buttonSection}>
            <Button href={resetUrl} style={button}>
              Restablecer Contraseña
            </Button>
          </Section>

          {/* Fallback link */}
          <Section style={content}>
            <Text style={smallText}>
              Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
            </Text>
            <Text style={linkText}>{resetUrl}</Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Este es un mensaje automático del sistema DonGalleta. Por favor, no respondas
              a este correo.
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
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
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
  color: '#c2410c',
  fontSize: '28px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
};

const content = {
  marginBottom: '24px',
};

const greeting = {
  color: '#111827',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px 0',
};

const paragraph = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
};

const buttonSection = {
  textAlign: 'center' as const,
  marginBottom: '28px',
};

const button = {
  backgroundColor: '#c2410c',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 32px',
  textDecoration: 'none',
};

const smallText = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '0 0 8px 0',
};

const linkText = {
  color: '#c2410c',
  fontSize: '13px',
  wordBreak: 'break-all' as const,
  margin: '0',
};

const footer = {
  borderTop: '1px solid #e5e7eb',
  paddingTop: '20px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#9ca3af',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
};

export default PasswordResetEmail;

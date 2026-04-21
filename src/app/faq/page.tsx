import { type Metadata } from "next"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Preguntas Frecuentes | Don Galleta",
  description: "Encuentra respuestas a las preguntas más comunes sobre nuestros productos, envíos, pagos y más en Don Galleta.",
  keywords: "FAQ, preguntas frecuentes, galletas, envíos, pagos, productos",
}

const faqData = {
  productos: [
    {
      question: "¿Qué tipos de galletas ofrecen?",
      answer: "Ofrecemos una amplia variedad de galletas artesanales que incluye galletas clásicas de chocolate chip, avena y canela, sin gluten, veganas, y ediciones especiales por temporada. Todas nuestras galletas son horneadas diariamente con ingredientes frescos y de alta calidad."
    },
    {
      question: "¿Las galletas contienen conservantes artificiales?",
      answer: "No, todas nuestras galletas son libres de conservantes artificiales. Utilizamos únicamente ingredientes naturales y técnicas de horneado tradicionales. Por esta razón, recomendamos consumirlas dentro de los 5-7 días posteriores a la compra para disfrutar de su máxima frescura."
    },
    {
      question: "¿Tienen opciones para personas con alergias alimentarias?",
      answer: "Sí, ofrecemos galletas sin gluten, sin lácteos y veganas. Todas están claramente etiquetadas en nuestra tienda online. Sin embargo, nuestras instalaciones procesan diversos ingredientes, por lo que no podemos garantizar que estén 100% libres de trazas."
    },
    {
      question: "¿Puedo personalizar mis galletas?",
      answer: "¡Absolutamente! Ofrecemos servicios de personalización para eventos especiales como cumpleaños, bodas y celebraciones corporativas. Puedes elegir sabores, decoraciones y empaque especial. Contacta a nuestro equipo con al menos 48 horas de anticipación."
    }
  ],
  envios: [
    {
      question: "¿Cuáles son los tiempos de entrega?",
      answer: "Para entregas locales (dentro de la ciudad): 2-4 horas durante horarios de servicio. Para envíos nacionales: 1-3 días hábiles dependiendo de la ubicación. Los pedidos realizados después de las 6:00 PM se procesan al siguiente día hábil."
    },
    {
      question: "¿Cuánto cuesta el envío?",
      answer: "Envío local: $5.000 COP (gratis en pedidos superiores a $50.000). Envío nacional: $12.000 - $20.000 COP según la zona (gratis en pedidos superiores a $80.000). Los costos exactos se calculan automáticamente durante el checkout."
    },
    {
      question: "¿Pueden entregar en horarios específicos?",
      answer: "Ofrecemos entregas programadas para pedidos locales en horarios de 9:00 AM a 8:00 PM, de lunes a domingo. Para horarios especiales fuera de este rango, contáctanos con anticipación para verificar disponibilidad (puede aplicar costo adicional)."
    },
    {
      question: "¿Qué pasa si no estoy en casa durante la entrega?",
      answer: "Nuestro repartidor intentará contactarte por teléfono. Si no hay respuesta, dejará el pedido con un vecino de confianza (previa autorización) o reagendará la entrega para el siguiente día hábil sin costo adicional en entregas locales."
    }
  ],
  pagos: [
    {
      question: "¿Qué métodos de pago aceptan?",
      answer: "Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), PSE, Nequi, Daviplata, y pago contra entrega para pedidos locales. Todos los pagos online están protegidos con encriptación SSL de alta seguridad."
    },
    {
      question: "¿Es seguro pagar en línea?",
      answer: "Completamente seguro. Utilizamos Stripe como procesador de pagos, que cumple con los estándares PCI DSS nivel 1. Tu información financiera está encriptada y nunca se almacena en nuestros servidores. Además, todas las transacciones están protegidas contra fraude."
    },
    {
      question: "¿Puedo pagar en efectivo?",
      answer: "Sí, aceptamos pago en efectivo únicamente para entregas locales mediante nuestro servicio de pago contra entrega. El repartidor llevará cambio para cualquier denominación hasta $50.000. Para pedidos superiores, recomendamos tener el valor exacto."
    },
    {
      question: "¿Emiten factura?",
      answer: "Sí, automáticamente enviamos factura electrónica a tu email después de cada compra. Si necesitas factura con datos específicos para empresas, puedes agregar esta información en tu perfil o durante el proceso de checkout."
    }
  ],
  pedidos: [
    {
      question: "¿Cómo puedo hacer seguimiento a mi pedido?",
      answer: "Recibirás un email de confirmación con el número de pedido inmediatamente después de la compra. Puedes hacer seguimiento en tiempo real desde tu perfil en la sección 'Mis Pedidos' o usando el link de seguimiento que te enviamos por email."
    },
    {
      question: "¿Puedo modificar o cancelar mi pedido?",
      answer: "Puedes modificar o cancelar tu pedido sin costo hasta 30 minutos después de realizada la compra (siempre que no haya entrado en proceso de horneado). Para cambios posteriores, contacta inmediatamente a nuestro servicio al cliente."
    },
    {
      question: "¿Qué pasa si mi pedido llega dañado?",
      answer: "Si tu pedido llega dañado o incompleto, contáctanos inmediatamente a través del chat en línea o WhatsApp. Te enviaremos un reemplazo completo sin costo adicional. Para pedidos dañados en tránsito, también ofrecemos reembolso completo."
    },
    {
      question: "¿Tienen programa de lealtad?",
      answer: "¡Sí! Nuestro programa 'Dulces Puntos' te permite acumular puntos con cada compra (1 punto por cada $1.000 gastados). Los puntos se pueden canjear por descuentos, galletas gratis, o acceso exclusivo a productos de temporada."
    }
  ]
}

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
          Preguntas Frecuentes
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Encuentra respuestas rápidas a las preguntas más comunes sobre nuestros productos,
          envíos, pagos y pedidos. Si no encuentras lo que buscas,
          <Link href="/contacto" className="text-primary hover:underline font-medium">
            {" "}contáctanos
          </Link>.
        </p>
      </div>

      {/* FAQ Sections */}
      <div className="space-y-6">
        {/* Productos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
              🍪 Productos y Sabores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqData.productos.map((faq, index) => (
                <AccordionItem key={`producto-${index}`} value={`producto-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Envíos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
              🚚 Envíos y Entregas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqData.envios.map((faq, index) => (
                <AccordionItem key={`envio-${index}`} value={`envio-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Pagos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
              💳 Pagos y Facturación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqData.pagos.map((faq, index) => (
                <AccordionItem key={`pago-${index}`} value={`pago-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Pedidos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
              📋 Pedidos y Seguimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqData.pedidos.map((faq, index) => (
                <AccordionItem key={`pedido-${index}`} value={`pedido-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* Contact CTA */}
      <div className="mt-12 text-center bg-secondary/50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-primary mb-2">
          ¿No encontraste lo que buscabas?
        </h2>
        <p className="text-muted-foreground mb-4">
          Nuestro equipo de soporte está aquí para ayudarte con cualquier pregunta adicional.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/contacto"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md font-medium transition-colors inline-block"
          >
            Contactar Soporte
          </a>
          <a
            href="https://wa.me/1234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white hover:bg-green-700 px-6 py-2 rounded-md font-medium transition-colors inline-block"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
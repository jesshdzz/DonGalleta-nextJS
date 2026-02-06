'use server';

import { contactSchema } from "@/lib/validators/contact-schema";

interface ContactResult {
  success: boolean;
  message?: string;
  errors?: {
    name?: string[];
    email?: string[];
    message?: string[];
  };
}

export async function sendContactMessage(prevState: any, formData: FormData): Promise<ContactResult> {
  // Extraer datos
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  };

  // Validar con Zod
  const validatedFields = contactSchema.safeParse(rawData);

  // Si hay errores de validación
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Por favor corrige los errores en el formulario'
    };
  }

  // Datos válidos
  const { name, email, message } = validatedFields.data;

  try {
    // Simular procesamiento del mensaje

    console.log('💬 Nuevo mensaje de contacto validado:');
    console.log('👤 Nombre:', name);
    console.log('📧 Email:', email);
    console.log('💭 Mensaje:', message);
    console.log('🕐 Fecha:', new Date().toLocaleString('es-ES'));

    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));

    // por implementar sistema de envío de correo o almacenamiento en base de datos

    return {
      success: true,
      message: 'Tu mensaje ha sido enviado correctamente.'
    };

  } catch (error) {
    console.error('Error al procesar mensaje de contacto:', error);

    return {
      success: false,
      message: 'Hubo un error al enviar tu mensaje. Por favor intenta nuevamente.'
    };
  }
}
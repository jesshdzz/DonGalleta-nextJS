'use server';

interface ContactResult {
  success: boolean;
  message?: string;
  errors?: {
    name?: string;
    email?: string;
    message?: string;
  };
}

export async function sendContactMessage(formData: FormData): Promise<ContactResult> {
  // Extraer datos del formulario
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;

  // Validaciones básicas
  const errors: ContactResult['errors'] = {};

  // Validar nombre
  if (!name || name.trim().length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres';
  }

  // Validar email
  if (!email || email.trim().length === 0) {
    errors.email = 'El correo electrónico es requerido';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = 'Por favor ingresa un correo electrónico válido';
    }
  }

  // Validar mensaje
  if (!message || message.trim().length < 10) {
    errors.message = 'El mensaje debe tener al menos 10 caracteres';
  }

  // Si hay errores, retornar sin procesar
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Por favor corrige los errores en el formulario',
      errors
    };
  }

  try {
    // Simular procesamiento del mensaje
    
    console.log('💬 Nuevo mensaje de contacto recibido:');
    console.log('👤 Nombre:', name);
    console.log('📧 Email:', email);
    console.log('💭 Mensaje:', message);
    console.log('🕐 Fecha:', new Date().toLocaleString('es-ES'));
    
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));

    // por implementar sistema de envío de correo o almacenamiento en base de datos

    return {
      success: true,
      message: 'Tu mensaje ha sido enviado correctamente. Nos pondremos en contacto contigo pronto.'
    };

  } catch (error) {
    console.error('Error al procesar mensaje de contacto:', error);
    
    return {
      success: false,
      message: 'Hubo un error al enviar tu mensaje. Por favor intenta nuevamente.'
    };
  }
}
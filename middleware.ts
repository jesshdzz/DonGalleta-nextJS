import NextAuth from 'next-auth';
import { authConfig } from './src/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // Excluir archivos estáticos y rutas de API públicas del middleware
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
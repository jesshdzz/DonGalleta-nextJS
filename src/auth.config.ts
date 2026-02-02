import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/auth/login', // Redirigir aquí si no está logueado
    newUser: '/auth/register',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnCart = nextUrl.pathname.startsWith('/cart');

      // Protección de Rutas de Admin
      if (isOnAdmin) {
        if (isLoggedIn) return true; // TODO: Agregar validación de rol aquí después
        return false; // Redirigir al login
      }
      
      // Permitir acceso a todo lo demás por defecto
      return true;
    },
    // Añadimos el Rol y el ID a la sesión del cliente
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      // @ts-ignore // Ignoramos error de tipado por ahora hasta extender tipos
      if (token.role && session.user) {
        // @ts-ignore
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        // @ts-ignore
        token.role = user.role;
      }
      return token;
    },
  },
  providers: [], // Se configuran en auth.ts para compatibilidad
} satisfies NextAuthConfig;
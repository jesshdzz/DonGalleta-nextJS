import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/auth/login', // Redirigir aquí si no está logueado
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');

      // Protección de Rutas de Admin (Si no hay sesión redirige al login. El rol se valida en app/admin/layout.tsx)
      if (isOnAdmin && !isLoggedIn) {
        return false;
      }

      // Permitir acceso a todo lo demás por defecto
      return true;
    },
    // Añadimos el Rol y el ID a la sesión del cliente
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  providers: [], // Se configuran en auth.ts para compatibilidad
} satisfies NextAuthConfig;
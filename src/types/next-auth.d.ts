import type { DefaultSession, DefaultUser } from 'next-auth';
import type { JWT as DefaultJWT } from 'next-auth/jwt';
import type { Role } from '@prisma/client';

declare module 'next-auth' {
  /** Extiende el objeto User que devuelve el adapter/authorize */
  interface User extends DefaultUser {
    role?: Role;
  }

  /** Extiende la sesión del cliente (useSession / auth()) */
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  /** Extiende el JWT token interno */
  interface JWT extends DefaultJWT {
    role?: Role;
  }
}

declare module '@auth/core/adapters' {
  /** Extiende AdapterUser para incluir role */
  interface AdapterUser {
    role?: Role;
  }
}

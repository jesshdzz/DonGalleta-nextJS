'use client';

import { useSession } from 'next-auth/react';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';

interface AdminNotificationProviderProps {
  children: React.ReactNode;
}

export function AdminNotificationProvider({ children }: AdminNotificationProviderProps) {
  const { data: session } = useSession();
  const user = session?.user as { role?: string } | undefined;
  const isAdmin = user?.role === "ADMIN";
  
  // 🔥 ACTIVAR NOTIFICACIONES PUSH
  useAdminNotifications(isAdmin);

  return <>{children}</>;
}
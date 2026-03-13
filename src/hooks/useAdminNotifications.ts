'use client';

import { useEffect } from 'react';
import Pusher from 'pusher-js';
import { toast } from 'sonner';

export function useAdminNotifications(isAdmin: boolean) {
  useEffect(() => {
    if (!isAdmin) {
      console.log('❌ Usuario no es admin, no configurando notificaciones');
      return;
    }

    console.log('🔧 Configurando notificaciones Pusher para admin...');
    console.log('Pusher Key:', process.env.NEXT_PUBLIC_PUSHER_KEY);
    console.log('Pusher Cluster:', process.env.NEXT_PUBLIC_PUSHER_CLUSTER);

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe('admin-notifications');
    
    channel.bind('pusher:subscription_succeeded', () => {
      console.log('✅ Conectado al canal admin-notifications');
    });

    channel.bind('nuevo-pedido', (data: any) => {
      console.log('🔔 Notificación recibida:', data);
      toast.success('🛒 ¡Nuevo pedido recibido!', {
        description: 'Revisa la sección de pedidos',
        duration: 8000,
      });
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
      console.log('🔌 Desconectado de notificaciones Pusher');
    };
  }, [isAdmin]);
}
import { useState, useEffect, useRef } from 'react';
import { api } from '@/src/utils/api';
import { showInfo } from '@/src/utils/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Notification {
  id: number;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida?: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const shownIdsRef = useRef<Set<number>>(new Set());

  // Cargar IDs de notificaciones mostradas desde AsyncStorage
  useEffect(() => {
    const loadShownIds = async () => {
      try {
        const stored = await AsyncStorage.getItem('shownNotificationIds');
        if (stored) {
          shownIdsRef.current = new Set(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Error loading shown notification IDs:', err);
      }
    };
    loadShownIds();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Verificar que el usuario esté autenticado
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api('/notifications');
      const notificationsList = Array.isArray(response) ? response : [];
      setNotifications(notificationsList);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  // Verificar nuevas notificaciones cada 10 segundos
  useEffect(() => {
    const checkNewNotifications = async () => {
      try {
        // Verificar autenticación primero
        const token = await AsyncStorage.getItem('authToken');
        if (!token) return;

        const response = await api('/notifications');
        const newNotifications = Array.isArray(response) ? response : [];

        // Mostrar toast para notificaciones que no se hayan mostrado antes y cuya fecha sea <= ahora, y no más viejas de 144 horas
        const now = new Date();
        newNotifications.forEach((notif: Notification) => {
          const notifDate = new Date(notif.fecha);
          const timeDiff = now.getTime() - notifDate.getTime();
          const maxAge = 144 * 60 * 60 * 1000; // 144 horas en ms
          if (notifDate <= now && timeDiff <= maxAge && !shownIdsRef.current.has(notif.id)) {
            showInfo(notif.mensaje, notif.titulo);
            shownIdsRef.current.add(notif.id);
            AsyncStorage.setItem('shownNotificationIds', JSON.stringify([...shownIdsRef.current]));
          }
        });

        // No actualizar notifications aquí para evitar re-renders constantes
      } catch (err) {
        console.error('Error checking notifications:', err);
      }
    };

    fetchNotifications();

    // Polling cada 10 segundos
    const interval = setInterval(checkNewNotifications, 10000);

    return () => clearInterval(interval);
  }, []);

  const createNotification = async (data: { titulo: string; mensaje: string; fecha_envio?: string }) => {
    try {
      const payload = {
        titulo: data.titulo.trim(),
        mensaje: data.mensaje.trim(),
        fecha_envio: data.fecha_envio || new Date().toISOString(),
      };
      
      await api('/notifications', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await fetchNotifications();
      return { success: true };
    } catch (err: any) {
      console.error('Error creating notification:', err);
      return { success: false, error: err.message || 'Error al crear la notificación' };
    }
  };

  const updateNotification = async (id: number, data: { titulo: string; mensaje: string; fecha_envio?: string }) => {
    try {
      await api(`/notifications/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          titulo: data.titulo.trim(),
          mensaje: data.mensaje.trim(),
          fecha_envio: data.fecha_envio || new Date().toISOString(),
        }),
      });
      await fetchNotifications();
      return { success: true };
    } catch (err: any) {
      console.error('Error updating notification:', err);
      return { success: false, error: err.message || 'Error al actualizar la notificación' };
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await api(`/notifications/${id}`, {
        method: 'DELETE',
      });
      await fetchNotifications();
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      return { success: false, error: err.message || 'Error al eliminar la notificación' };
    }
  };

  return { 
    notifications, 
    loading, 
    error, 
    refetch: fetchNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
  };
}

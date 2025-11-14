import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NotificationCardProps {
  notification: {
    id: number;
    titulo: string;
    mensaje: string;
    fecha: string;
  };
  user: any;
  onEdit?: (notification: any) => void;
  onDelete?: (id: number) => void;
}

export default function NotificationCard({ 
  notification,
  user,
  onEdit, 
  onDelete 
}: NotificationCardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar el tiempo actual cada segundo para verificar si sigue siendo programada
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isAdmin = user?.tipo_rol === "admin";
  const isClientOrTrainer = user?.tipo_rol === "cliente" || user?.tipo_rol === "entrenador";

  const notifDate = new Date(notification.fecha);
  const now = currentTime;
  const isProgrammed = notifDate > now;

  // Si es cliente o entrenador y la notificación está programada, no mostrar la card
  if (isClientOrTrainer && isProgrammed) {
    return null;
  }

  const isLongTitle = notification.titulo.length > 50;
  const isLongMessage = notification.mensaje.length > 150;

  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons 
          name={isProgrammed ? "time-outline" : "notifications-outline"} 
          size={32} 
          color={isProgrammed ? "#f59e0b" : "#3b82f6"} 
        />
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, isLongTitle && styles.titleSmall]}>
          {notification.titulo}
        </Text>
        <Text style={[styles.message, isLongMessage && styles.messageSmall]}>
          {notification.mensaje}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.date}>
            {notifDate.toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
          
          <View style={[
            styles.badge, 
            isProgrammed ? styles.programmedBadge : styles.sentBadge
          ]}>
            <Text style={styles.badgeText}>
              {isProgrammed 
                ? 'Programada'
                : (isAdmin ? 'Enviada' : 'Recibida')
              }
            </Text>
          </View>
        </View>
      </View>

      {isAdmin && isProgrammed && onEdit && onDelete && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit(notification)}
          >
            <Ionicons name="create-outline" size={22} color="#f97316" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete(notification.id)}
          >
            <Ionicons name="trash-outline" size={22} color="#ef4444" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  titleSmall: {
    fontSize: 14,
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  messageSmall: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  programmedBadge: {
    backgroundColor: '#fef3c7',
  },
  sentBadge: {
    backgroundColor: '#dbeafe',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1f2937',
  },
  actions: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
});

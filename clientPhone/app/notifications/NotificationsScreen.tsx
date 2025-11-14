import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotifications } from '@/hooks/use-notifications';
import NotificationCard from '@/components/notifications/NotificationCard';
import NotificationForm from '@/components/notifications/NotificationForm';
import { Ionicons } from '@expo/vector-icons';
import { requireAuth } from '@/src/utils/authGuard';
import { useFocusEffect } from '@react-navigation/native';
import { showSuccess, showError } from '@/src/utils/toast';

export default function NotificationsScreen() {
  const { 
    notifications, 
    loading, 
    error, 
    refetch,
    createNotification,
    updateNotification,
    deleteNotification,
  } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState<any>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    mensaje: '',
    fecha_envio: '',
  });
  const [user, setUser] = useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      requireAuth();
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      const loadUserData = async () => {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      };
      loadUserData();
    }, [])
  );

  
  const isAdmin = user?.tipo_rol === "admin";
  const isClientOrTrainer = user?.tipo_rol === "cliente" || user?.tipo_rol === "entrenador";

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleEditNotification = (notification: any) => {
    const notifDate = new Date(notification.fecha);
    const formattedDate = notifDate.toISOString().slice(0, 16);

    setFormData({
      titulo: notification.titulo,
      mensaje: notification.mensaje,
      fecha_envio: formattedDate,
    });
    setEditingNotification(notification);
    setShowForm(true);
  };

  const handleDeleteNotification = async (id: number) => {
    Alert.alert(
      'Cancelar Notificación',
      '¿Estás seguro de que deseas cancelar esta notificación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteNotification(id);
            if (result.success) {
              showSuccess('Notificación cancelada exitosamente');
            } else {
              showError(result.error || 'Error al cancelar la notificación');
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.titulo.trim() || !formData.mensaje.trim()) {
      showError('Título y mensaje son obligatorios');
      return;
    }

    if (formData.titulo.length > 100) {
      showError('El título no puede exceder los 100 caracteres');
      return;
    }

    if (formData.mensaje.length > 255) {
      showError('El mensaje no puede exceder los 255 caracteres');
      return;
    }

    // Validar fecha si se proporciona
    if (formData.fecha_envio) {
      const fechaSeleccionada = new Date(formData.fecha_envio);
      const fechaActual = new Date();

      if (fechaSeleccionada < fechaActual) {
        showError('No puedes programar una notificación en el pasado');
        return;
      }
    }
    
    const dataToSend = {
      titulo: formData.titulo,
      mensaje: formData.mensaje,
      fecha_envio: formData.fecha_envio && formData.fecha_envio.trim() ? new Date(formData.fecha_envio).toISOString() : new Date().toISOString(),
    };

    let result;
    if (editingNotification) {
      result = await updateNotification(editingNotification.id, dataToSend);
    } else {
      result = await createNotification(dataToSend);
    }

    if (result.success) {
      showSuccess(
        editingNotification
          ? 'Notificación actualizada correctamente'
          : 'Notificación creada correctamente'
      );
      setShowForm(false);
      setFormData({ titulo: '', mensaje: '', fecha_envio: '' });
      setEditingNotification(null);
    } else {
      showError(result.error || 'Error al guardar la notificación');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingNotification(null);
    setFormData({ titulo: '', mensaje: '', fecha_envio: '' });
  };

  // Esperar a que se cargue el usuario
  if (!user || (loading && !refreshing)) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Cargando notificaciones...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>
            {isAdmin ? 'Panel de Notificaciones' : 'Mis Notificaciones'}
          </Text>
          {isAdmin && (
            <Text style={styles.adminBadge}>ADMIN</Text>
          )}
        </View>
        <Ionicons name="notifications" size={28} color="#f97316" />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#f97316']}
            tintColor="#f97316"
          />
        }
      >
        {isClientOrTrainer && (
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color="#3b82f6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>📬 Notificaciones del Gimnasio</Text>
              <Text style={styles.infoText}>
                Aquí encontrarás todos los anuncios e información importante
              </Text>
            </View>
          </View>
        )}

        {isAdmin && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.newButton}
              onPress={() => {
                setShowForm(!showForm);
                if (showForm) {
                  setEditingNotification(null);
                  setFormData({ titulo: '', mensaje: '', fecha_envio: '' });
                }
              }}
            >
              <Ionicons 
                name={showForm ? 'close-circle' : 'add-circle'} 
                size={24} 
                color="white" 
              />
              <Text style={styles.newButtonText}>
                {showForm
                  ? 'Cancelar'
                  : editingNotification
                  ? 'Cancelar Edición'
                  : 'Nueva Notificación'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {showForm && isAdmin && (
          <View style={styles.formWrapper}>
            <Text style={styles.formTitle}>
              {editingNotification ? 'Editar Notificación' : 'Nueva Notificación'}
            </Text>
            <NotificationForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isEditing={!!editingNotification}
            />
          </View>
        )}

        <View style={styles.listWrapper}>
          {notifications && notifications.length > 0 ? (
            notifications.map((notif) => {
              return (
                <NotificationCard
                  key={notif.id}
                  notification={notif}
                  user={user}
                  onEdit={handleEditNotification}
                  onDelete={handleDeleteNotification}
                />
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={80} color="#d1d5db" />
              <Text style={styles.emptyText}>
                {isClientOrTrainer
                  ? 'No tienes notificaciones en este momento'
                  : 'No hay notificaciones disponibles'}
              </Text>
              {isClientOrTrainer && (
                <Text style={styles.emptySubtext}>
                  Aquí aparecerán los anuncios importantes del gimnasio
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#3b82f6',
  },
  listContent: {
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f97316',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  newButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  formWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  listWrapper: {
    padding: 16,
  },
  headerContent: {
    flex: 1,
  },
  adminBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#f97316',
    backgroundColor: '#fed7aa',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
});

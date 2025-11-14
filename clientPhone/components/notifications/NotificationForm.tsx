import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerComponent from './DateTimePicker';

interface NotificationFormData {
  titulo: string;
  mensaje: string;
  fecha_envio: string;
}

interface NotificationFormProps {
  formData: NotificationFormData;
  setFormData: (data: NotificationFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

export default function NotificationForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEditing,
}: NotificationFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Obtener fecha y hora mínima (ahora) en formato local YYYY-MM-DD
  const now = new Date();
  const minDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    if (formData.fecha_envio && formData.fecha_envio.trim()) {
      setSelectedDate(new Date(formData.fecha_envio));
    } else {
      setSelectedDate(null);
    }
  }, [formData.fecha_envio]);

  const handleChange = (field: keyof NotificationFormData, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      // Formato local YYYY-MM-DDTHH:mm para coincidir con datetime-local de la web
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
      
      setFormData({
        ...formData,
        fecha_envio: formattedDate,
      });
    } else {
      setFormData({
        ...formData,
        fecha_envio: '',
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Título *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Mantenimiento programado"
          placeholderTextColor="#9ca3af"
          value={formData.titulo}
          onChangeText={(text) => handleChange('titulo', text)}
          maxLength={100}
        />
        <Text style={styles.charCount}>{formData.titulo.length}/100</Text>

        <Text style={styles.label}>Mensaje *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Escribe el mensaje de la notificación..."
          placeholderTextColor="#9ca3af"
          value={formData.mensaje}
          onChangeText={(text) => handleChange('mensaje', text)}
          multiline
          numberOfLines={4}
          maxLength={255}
        />
        <Text style={styles.charCount}>{formData.mensaje.length}/255</Text>

        <DateTimePickerComponent
          value={selectedDate}
          onChange={handleDateChange}
          label="Fecha y Hora de Envío (Opcional)"
          minDateTime={minDateTime}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <Ionicons name="close-circle-outline" size={20} color="#6b7280" />
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={onSubmit}
          >
            <Ionicons
              name={isEditing ? 'checkmark-circle-outline' : 'send-outline'}
              size={20}
              color="white"
            />
            <Text style={styles.submitButtonText}>
              {isEditing ? 'Actualizar' : 'Crear'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitButton: {
    backgroundColor: '#f97316',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

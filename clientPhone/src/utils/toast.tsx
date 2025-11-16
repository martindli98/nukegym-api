import Toast from 'react-native-toast-message';

export const showSuccess = (message: string, title?: string) => {
  Toast.show({
    type: 'success',
    text1: title || 'Éxito',
    text2: message,
    position: 'top',
    visibilityTime: 3000,
    topOffset: 60,
     text1Style: { fontSize: 14 }, // Aumentado 10% aproximadamente
    text2Style: { fontSize: 12 }, // Aumentado 10% aproximadamente
  });
};

export const showError = (message: string, title?: string) => {
  Toast.show({
    type: 'error',
    text1: title || 'Error',
    text2: message,
    position: 'top',
    visibilityTime: 4000,
    topOffset: 70,
    text1Style: { fontSize: 14 }, // Aumentado 10% aproximadamente
    text2Style: { fontSize: 12 }, // Aumentado 10% aproximadamente
  });
};

export const showInfo = (message: string, title?: string) => {
  Toast.show({
    type: 'info',
    text1: title || 'Información',
    text2: message,
    position: 'top',
    visibilityTime: 5000, // Aumentado de 3000 a 5000 (2 segundos más)
    topOffset: 60,
    text1Style: { fontSize: 18 }, // Aumentado 10% aproximadamente
    text2Style: { fontSize: 16 }, // Aumentado 10% aproximadamente
  });
};

export const showWarning = (message: string, title?: string) => {
  Toast.show({
    type: 'warning',
    text1: title || 'Advertencia',
    text2: message,
    position: 'top',
    visibilityTime: 3500,
    topOffset: 60,
  });
};

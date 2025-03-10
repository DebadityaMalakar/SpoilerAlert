// utils/alert.ts
import { Platform, Alert } from 'react-native';

// Check if the platform is web
const isWeb = Platform.OS === 'web';

// Platform-agnostic alert utility
export const showAlert = (title: string, message: string, onPress?: () => void) => {
  if (isWeb) {
    window.alert(`${title}\n${message}`);
    if (onPress) onPress();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress }]);
  }
};
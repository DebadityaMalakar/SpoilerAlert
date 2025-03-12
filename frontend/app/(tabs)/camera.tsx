import React, { useState, useRef, useEffect } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert, Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import * as Speech from 'expo-speech';

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [classification, setClassification] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      (async () => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'We need access to save photos.');
        }
      })();
    }
  }, []);

  if (!cameraPermission) return <View />;
  if (!cameraPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to use the camera.</Text>
        <Button onPress={requestCameraPermission} title="Grant Permission" />
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const takePictureAndClassify = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      setClassification(null);

      // Capture the image
      const photoResult = await cameraRef.current.takePictureAsync({ 
        base64: true,
        quality: 0.8,
      });

      if (!photoResult || !photoResult.base64) {
        Alert.alert('Error', 'Failed to capture image.');
        setIsProcessing(false);
        return;
      }

      const base64Data = photoResult.base64;
      const serverUrl = 'http://10.9.175.241:8000/predict/';

      // Send image to the prediction server
      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data }),
      });

      const result = await response.json();
      if (response.ok && result.predicted_class !== undefined) {
        const foodState = result.predicted_class === 0 ? 'Not Rotten' : 'Rotten';
        setClassification(foodState);
        console.log('Classification:', foodState); // Debugging line

        // Speak the food state
        Speech.speak(`The food is ${foodState}`, {
          language: 'en',
          rate: 1.0,
          pitch: 1.0,
        });

        // Create FormData
        const formData = new FormData();
        formData.append('image', {
          uri: photoResult.uri,
          name: 'photo.jpg',
          type: 'image/jpeg',
        } as any); // `as any` to fix TypeScript FormData type issue
        formData.append('food_state', foodState);
        formData.append('food_name', 'Sample Food'); // Optional
        formData.append('food_type', 'Sample Type'); // Optional

        const backendUrl = 'http://10.9.164.95:3000/api/food/add';

        const backendResponse = await fetch(backendUrl, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json', // Accept JSON response
          },
        });

        const backendResult = await backendResponse.json();
        if (!backendResponse.ok) {
          throw new Error(backendResult.message || 'Failed to send data to the backend.');
        }

        console.log('Successfully sent data:', backendResult);
      } else {
        Alert.alert('Error', 'Invalid response from prediction server.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to process the image.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing} disabled={isProcessing}>
            <MaterialIcons name="flip-camera-android" size={40} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, isProcessing && styles.disabledButton]} 
            onPress={takePictureAndClassify}
            disabled={isProcessing}
          >
            <Entypo name="circle" size={40} color={isProcessing ? "#999" : "#fff"} />
          </TouchableOpacity>
        </View>
      </CameraView>

      {isProcessing && (
        <View style={styles.processingContainer}>
          <Text style={styles.processingText}>Analyzing image...</Text>
        </View>
      )}

      {classification && !isProcessing && (
        <View style={styles.resultContainer}>
          <Text style={[
            styles.resultText, 
            classification === 'Rotten' ? styles.rottenText : styles.notRottenText
          ]}>
            {classification}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  message: { textAlign: 'center', paddingBottom: 10 },
  camera: { flex: 1 },
  buttonContainer: { 
    flex: 1, 
    flexDirection: 'row', 
    backgroundColor: 'transparent', 
    margin: 64, 
    justifyContent: 'space-between', 
    alignItems: 'flex-end' 
  },
  button: { alignSelf: 'flex-end', alignItems: 'center', padding: 10 },
  disabledButton: { opacity: 0.5 },
  resultContainer: { position: 'absolute', bottom: 50, width: '100%', alignItems: 'center' },
  resultText: { fontSize: 24, fontWeight: 'bold', color: 'white', backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 8 },
  rottenText: { backgroundColor: 'rgba(255,0,0,0.7)' },
  notRottenText: { backgroundColor: 'rgba(0,128,0,0.7)' },
  processingContainer: { position: 'absolute', bottom: 50, width: '100%', alignItems: 'center' },
  processingText: { fontSize: 20, fontWeight: 'bold', color: 'white', backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 8 },
});
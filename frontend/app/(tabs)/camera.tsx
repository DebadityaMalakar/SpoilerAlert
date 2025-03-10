import React, { useState, useRef, useEffect } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert, Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import * as Speech from 'expo-speech'; // Import expo-speech

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

      // 🔥 Send image to server
      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data }),
      });

      const result = await response.json();
      if (response.ok && result.predicted_class !== undefined) {
        const classificationResult = result.predicted_class === 0 ? 'Not Rotten' : 'Rotten';
        setClassification(classificationResult);

        // 🔥 Speak the classification result
        Speech.speak(`The food is ${classificationResult}`, {
          language: 'en', // Language code
          rate: 1.0, // Speed of speech
          pitch: 1.0, // Pitch of speech
        });
      } else {
        Alert.alert('Error', 'Invalid response from server.');
      }
      
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to connect to the server.');
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
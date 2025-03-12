import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL = "http://10.9.164.95:3000/signup"; // Your API endpoint

const SignUpScreen: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      console.log(data);
      if (data._id) {
        const userToken = data._id;

        if (Platform.OS === "web") {
          localStorage.setItem("userToken", userToken);
          window.location.href = "/"; // Redirect on web
        } else {
          await SecureStore.setItemAsync("userToken", userToken);
          router.replace("/"); // Navigate on native
        }

        Alert.alert("Success", "Account created!");
      } else {
        throw new Error("Signup failed: Invalid response");
      }
    } catch (error) {
      let errorMessage = "Signup failed";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Signing Up..." : "Sign Up"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => {
        if (Platform.OS === "web") {
          window.location.href = "/LoginScreen";
        } else {
          router.replace("/LoginScreen");
        }
      }}>
        <Text style={styles.loginText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#333',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
    color: '#fff',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginText: {
    marginTop: 16,
    color: '#1E90FF',
    textAlign: 'center',
  },
});

export default SignUpScreen;

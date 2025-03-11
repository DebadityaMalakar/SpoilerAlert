import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function ProfileScreen() {
  const [user, setUser] = useState<{ name: string; profession: string; tokens: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let userToken = Platform.OS === 'web' 
          ? localStorage.getItem("userToken") 
          : await SecureStore.getItemAsync("userToken");

        if (!userToken) {
          throw new Error("User not authenticated");
        }

        const response = await fetch(`http://192.168.158.114:3000/api/user/${userToken}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch user data");
        }

        setUser(data);
      } catch (error) {
        let errorMessage = "An error occurred";

        if (error instanceof Error) {
          errorMessage = error.message;
        }

        Alert.alert("Error", errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>Failed to load user data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image source={require('@/assets/images/profile.png')} style={styles.profileImage} />
        <View style={styles.textContainer}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.profession}>Profession: {user.profession}</Text>
          {/* <Text style={styles.tokens}>Tokens: {user.tokens}</Text> */}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(100, 216, 126, 0.5)',
    justifyContent: 'center',
  },
  profileContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 15,
  },
  textContainer: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontFamily: 'Poppins-Regular',
    color: '#fff',
  },
  profession: {
    fontSize: 20,
    fontFamily: 'Poppins-Regular',
    color: '#fff',
  },
  tokens: {
    fontSize: 20,
    fontFamily: 'Poppins-Regular',
    color: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#fff',
  },
});

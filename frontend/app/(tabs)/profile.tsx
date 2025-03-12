import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, Image, ActivityIndicator, Alert, TouchableOpacity, Platform, TextInput, PanResponder 
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';


const API_URL = "http://10.9.164.95:3000/api"; // Update with your server URL

export default function ProfileScreen() {
  const [user, setUser] = useState<{ 
    name: string; 
    profession: string; 
    username: string;
    date_of_birth: string;
    tokens: number; 
    email: string;
  } | null>(null);

  const [userToken, setUserToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Editing states
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingProfession, setIsEditingProfession] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newProfession, setNewProfession] = useState('');

  // PanResponder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) {
          router.push('/'); // Swipe left → Home
        } else if (gestureState.dx > 50) {
          router.push('/camera'); // Swipe right → Camera
        }
      },
    })
  ).current;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let token = Platform.OS === 'web' 
          ? localStorage.getItem("userToken") 
          : await SecureStore.getItemAsync("userToken");

        if (!token) {
          showSessionExpiredAlert();
          clearStorageAndRedirect();
          return;
        }

        setUserToken(token); // Store userToken

        const response = await fetch(`${API_URL}/user/${token}`);
        const data = await response.json();

        if (data.error === "User not found") {
          showSessionExpiredAlert();
          clearStorageAndRedirect();
          return;
        }

        if (!response.ok) throw new Error("Failed to fetch user data");

        setUser(data);
        setNewUsername(data.username); // Pre-fill username
        setNewProfession(data.profession); // Pre-fill profession

        // Fetch profile image
        const imageUrl = `${API_URL}/user/image/${token}`;
        const imageResponse = await fetch(imageUrl);
        if (imageResponse.ok) {
          setProfileImage(imageUrl);
        }
      } catch (error) {
        Alert.alert("Error", error instanceof Error ? error.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const showSessionExpiredAlert = () => {
    if (Platform.OS === 'web') {
      window.alert("Session Expired or Not Found");
    } else {
      Alert.alert("Session Expired or Not Found");
    }
  };

  const clearStorageAndRedirect = async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem("userToken");
      window.location.href = "/LoginScreen";
    } else {
      await SecureStore.deleteItemAsync("userToken");
      router.replace("/LoginScreen");
    }
  };

  // Update Username
  const handleUpdateUsername = async () => {
    if (!userToken) return;

    try {
      const response = await fetch(`${API_URL}/user/${userToken}/username`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername }), // Use lowercase "username"
      });

      if (!response.ok) throw new Error("Failed to update username");

      setUser((prev) => prev ? { ...prev, username: newUsername } : prev);
      setIsEditingUsername(false);
      Alert.alert("Success", "Username updated!");
    } catch (error) {
      Alert.alert("Error", "Could not update username.");
    }
  };

  // Update Profession
  const handleUpdateProfession = async () => {
    if (!userToken) return;

    try {
      const response = await fetch(`${API_URL}/user/${userToken}/profession`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profession: newProfession }),
      });

      if (!response.ok) throw new Error("Failed to update profession");

      setUser((prev) => prev ? { ...prev, profession: newProfession } : prev);
      setIsEditingProfession(false);
      Alert.alert("Success", "Profession updated!");
    } catch (error) {
      Alert.alert("Error", "Could not update profession.");
    }
  };

  // Calculate age from date_of_birth
  const calculateAge = (dob: string): number | null => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();

    if (
      today.getMonth() < birthDate.getMonth() || 
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 0 ? age : null;
  };


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
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.profileContainer}>
        <Image 
          source={profileImage ? { uri: profileImage } : require('@/assets/images/profile.png')} 
          style={styles.profileImage} 
        />

        {/* Username Section */}
        {isEditingUsername ? (
          <View style={styles.editContainer}>
            <TextInput 
              style={styles.input}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Enter new username"
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleUpdateUsername}>
              <Text style={styles.buttonText}>Save Username</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setIsEditingUsername(true)}>
            <Text style={styles.username}>@{user.username} ✏️</Text>
          </TouchableOpacity>
        )}

        {/* Profession Section */}
        {isEditingProfession ? (
          <View style={styles.editContainer}>
            <TextInput 
              style={styles.input}
              value={newProfession}
              onChangeText={setNewProfession}
              placeholder="Enter new profession"
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfession}>
              <Text style={styles.buttonText}>Save Profession</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setIsEditingProfession(true)}>
            <Text style={styles.profession}>Profession: {user.profession} ✏️</Text>
          </TouchableOpacity>
        )}

        {user.date_of_birth && (
          <Text style={styles.age}>Age: {calculateAge(user.date_of_birth)} years</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  age:{
    fontSize: 20,
    fontFamily: "OpenSans-Regular"
  },
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
  editContainer: {
    alignItems: 'center',
    width: '80%',
  },
  input: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#28A745',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  username: {
    fontSize: 20,
    color: '#100',
    fontFamily: "Poppins-Regular"
  },
  profession: {
    fontSize: 20,
    color: '#fff',
    fontFamily: "Poppins-Regular"
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(100, 216, 126, 0.5)',
  },
  errorText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: "Poppins-Regular"
  },
});
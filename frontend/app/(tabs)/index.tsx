import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import {  useEffect } from 'react';
import { Platform } from 'react-native';

const getAuthToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem('userToken') || null;
    } else {
      return await SecureStore.getItemAsync('userToken');
    }
  } catch (error) {
    console.error('Error fetching auth token:', error);
    return null;
  }
};

type Item = {
  id: string;
  name: string;
  image: any;
};

const fruits: Item[] = [
  { id: '1', name: 'Apple', image: require('@/assets/images/apple.png') },
  { id: '2', name: 'Banana', image: require('@/assets/images/banana.png') },
  { id: '3', name: 'Orange', image: require('@/assets/images/orange.png') },
];

const vegetables: Item[] = [
  { id: '1', name: 'Carrot', image: require('@/assets/images/carrot.png') },
  { id: '2', name: 'Broccoli', image: require('@/assets/images/broccoli.png') },
  { id: '3', name: 'Tomato', image: require('@/assets/images/tomato.png') },
];

type SlideshowProps = {
  data: Item[];
};

const Slideshow: React.FC<SlideshowProps> = ({ data }) => {
  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAuthToken();
      if (!token) {
        router.replace('/LoginScreen');
      }
    };

    checkAuth();
  }, []);

  return (
    <FlatList
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.slide}>
          <Image source={item.image} style={styles.image} />
          <Text style={styles.slideText}>{item.name}</Text>
        </View>
      )}
    />
  );
};

export default function HomeScreen(): JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Fruits</Text>
        <Slideshow data={fruits} />
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Vegetables</Text>
        <Slideshow data={vegetables} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(100, 216, 126, 0.5)',
  },
  section: {
    width: '90%',
    padding: 20,
    marginVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'OpenSans-Bold',
    marginBottom: 10,
  },
  slide: {
    alignItems: 'center',
    marginRight: 15,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 50,
  },
  slideText: {
    marginTop: 5,
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    fontWeight: 'bold',
  },
});
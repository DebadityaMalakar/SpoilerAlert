import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF', // Active tab color
        tabBarStyle: {
          backgroundColor: '#fff', // Tab bar background color
          height: 60,
          paddingBottom: 10,
        },
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />

      {/* Search Tab */}
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="search" size={size} color={color} />,
        }}
      />

      {/* Game Tab */}
      <Tabs.Screen
        name="game"
        options={{
          title: 'Game',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="sports-esports" size={size} color={color} />,
        }}
      />

      {/* Camera Tab */}
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Camera',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="camera-alt" size={size} color={color} />,
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="person" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // This prevents it from appearing in the tabs
        }}
      />
      <Tabs.Screen
      name="LoginScreen"
      options={{href:null,}}/>
      <Tabs.Screen
      name="SignupScreen"
      options={{href:null,}}/>
    </Tabs>
  );
}

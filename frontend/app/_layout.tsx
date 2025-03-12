import { Stack } from "expo-router";
import { Text } from "react-native";
import { useFonts } from 'expo-font';

import "./global.css";
import React from "react";

export default function RootLayout() {

    const [fontsLoaded] = useFonts({
        'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
        'OpenSans-Bold': require("@/assets/fonts/OpenSans-Bold.ttf"),
        'OpenSans-Regular': require("@/assets/fonts/OpenSans-Regular.ttf")
    });
    
    if (!fontsLoaded) return <Text>Loading...</Text>;

    return <Stack screenOptions={{headerShown:false}}/>;
}
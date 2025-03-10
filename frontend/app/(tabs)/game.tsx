import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import questions from '@/utils/questions'; // Updated import path
import { Storage } from '@/utils/storage'; // Import the storage utility
import { showAlert } from '@/utils/alert'; // Import the alert utility

export default function GameTab() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userChoice, setUserChoice] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  // Load the current image from the questions array
  const currentImage = questions[currentImageIndex];

  useEffect(() => {
    const loadScore = async () => {
      const storedScore = await Storage.getItem('score'); // Use Storage utility
      if (storedScore) {
        setScore(parseInt(storedScore, 10));
      }
    };
    loadScore();
  }, []);

  const handleChoice = async (choice: string) => {
    setUserChoice(choice);

    // Check if the choice is correct
    const isCorrect = choice === currentImage.answer;
    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
      await Storage.setItem('score', (score + 1).toString()); // Use Storage utility
    }

    // Show feedback to the user
    showAlert(
      isCorrect ? 'Correct!' : 'Incorrect!',
      `You selected: ${choice}. The correct answer is ${currentImage.answer}.`,
      () => {
        if (currentImageIndex < questions.length - 1) {
          setCurrentImageIndex((prevIndex) => prevIndex + 1);
        } else {
          showAlert('Game Over', `Your final score is ${score + (isCorrect ? 1 : 0)}/${questions.length}`);
          setCurrentImageIndex(0); // Restart the game
          setScore(0);
          Storage.deleteItem('score'); // Use Storage utility
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Is this edible?</Text>
      <Text style={styles.score}>Score: {score}/{questions.length}</Text>
      <Image source={currentImage.source} style={styles.image} />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => handleChoice('Edible')}>
          <Text style={styles.buttonText}>Edible</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handleChoice('Not Edible')}>
          <Text style={styles.buttonText}>Not Edible</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  score: { fontSize: 18, marginBottom: 16 },
  image: { width: 300, height: 300, borderRadius: 10, marginBottom: 16 },
  buttonContainer: { flexDirection: 'row', marginTop: 20 },
  button: { backgroundColor: '#007BFF', padding: 10, borderRadius: 5, marginHorizontal: 10 },
  buttonText: { color: 'white', fontSize: 18 },
});
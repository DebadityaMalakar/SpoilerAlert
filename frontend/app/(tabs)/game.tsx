import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import useQuestions from '@/utils/questions';
import { Storage } from '@/utils/storage';
import { showAlert } from '@/utils/alert';

export default function GameTab() {
  const { questions, questionCount, refreshQuestions } = useQuestions(); // Use manual count
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [userChoice, setUserChoice] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadScore = async () => {
      const storedScore = await Storage.getItem('score');
      if (storedScore) {
        setScore(parseInt(storedScore, 10));
      }
    };
    loadScore();
  }, []);

  useEffect(() => {
    console.log("Updated Questions List:", questions);
    console.log("Total Questions Count:", questionCount);
    if (questions.length > 0) {
      setLoading(false);
    }
  }, [questions]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading game data...</Text>
      </View>
    );
  }

  if (!questions || questionCount === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No questions available. Please check your connection.</Text>
      </View>
    );
  }

  const currentImage = questions[currentImageIndex];

  const handleChoice = async (choice: string) => {
    setUserChoice(choice);
  
    const isCorrect = choice === currentImage.answer;
  
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
      await Storage.setItem('score', (score + 1).toString());
    }
  
    // ✅ Add a delay before showing the alert
    setTimeout(() => {
      showAlert(
        isCorrect ? 'Correct!' : 'Incorrect!',
        `You selected: ${choice}. The correct answer is ${currentImage.answer}.`,
        async () => {
          if (currentImageIndex < questions.length - 1) {
            setCurrentImageIndex(prevIndex => prevIndex + 1);
          } else {
            const finalScore = score + (isCorrect ? 1 : 0);
            showAlert('Game Over', `Your final score is ${finalScore}/${questions.length}`);
  
            // Reset for new game
            setCurrentImageIndex(0);
            setScore(0);
            await Storage.deleteItem('score');
  
            setLoading(true);
            await refreshQuestions();
          }
        }
      );
    }, 500); // ⏳ 3-second delay
  };
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Is this edible?</Text>
      <Text style={styles.score}>Score: {score}/{questionCount}</Text>
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
  loadingText: { fontSize: 18, marginTop: 10, color: '#555' },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center' },
});

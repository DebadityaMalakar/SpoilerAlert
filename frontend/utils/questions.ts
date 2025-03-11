import { useEffect, useState } from 'react';
import { ImageSourcePropType } from 'react-native';

export interface Question {
  source: ImageSourcePropType;
  answer: 'Edible' | 'Not Edible';
}

const fetchQuestions = async (): Promise<Question[]> => {
  try {
    const URL = "http://192.168.158.114:3000";
    const response = await fetch(`${URL}/api/food`);
    const data = await response.json();
    
    console.log(data);
    
    return data.map((item: { image_uri: string; food_state: string }) => ({
      source: { uri: URL + item.image_uri },
      answer: item.food_state === 'Not Rotten' ? 'Edible' : 'Not Edible',
    }));
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
};

const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(0);

  const calculateLength = (data: Question[]) => {
    let count = 0;
    for (const _ of data) {
      count++;
    }
    setQuestionCount(count);
  };

  const refreshQuestions = async () => {
    const fetchedQuestions = await fetchQuestions();
    setQuestions(fetchedQuestions);
    calculateLength(fetchedQuestions);
  };

  useEffect(() => {
    refreshQuestions();
  }, []);

  return { questions, questionCount, refreshQuestions };
};

export default useQuestions;

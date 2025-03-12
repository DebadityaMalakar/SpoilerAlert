import { useEffect, useState } from "react";
import { ImageSourcePropType } from "react-native";

export interface Question {
  source: ImageSourcePropType;
  answer: "Edible" | "Not Edible";
}

const fetchQuestions = async (): Promise<Question[]> => {
  try {
    const URL = "http://10.9.164.95:3000";
    const response = await fetch(`${URL}/api/food`);
    const data = await response.json();

    console.log("Fetched Questions:", data);

    // Transform data into Question format
    const formattedQuestions = data.map((item: { image_uri: string; food_state: string }) => ({
      source: { uri: `${URL}${item.image_uri}` },
      answer: item.food_state === "Not Rotten" ? "Edible" : "Not Edible",
    }));

    // If less than 10 questions exist, return all; otherwise, pick 10 random ones
    return formattedQuestions.length <= 10
      ? formattedQuestions
      : formattedQuestions.sort(() => Math.random() - 0.5).slice(0, 10);
  } catch (error) {
    console.error("Error fetching questions:", error);
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

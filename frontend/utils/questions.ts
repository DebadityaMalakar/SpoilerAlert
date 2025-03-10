import { ImageSourcePropType } from 'react-native';

export interface Question {
  source: ImageSourcePropType;
  answer: 'Edible' | 'Not Edible';
}

const questions: Question[] = [
  {
    source: require('@/assets/question/question1.jpg'), // Correct path to the image
    answer: 'Edible',
  },
  {
    source: require('@/assets/question/question2.jpg'),
    answer: 'Not Edible',
  },
  {
    source: require('@/assets/question/question3.jpg'),
    answer: 'Edible',
  },
  {
    source: require('@/assets/question/question4.jpg'),
    answer: 'Not Edible',
  },
  // Add more questions as needed
];

export default questions;
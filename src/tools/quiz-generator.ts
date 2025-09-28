
import { tool } from '@langchain/core/tools';
import { llm } from '../lib/groq-client';
import { z } from 'zod';

export const quizGeneratorTool = tool(
  async ({ numQuestions, difficulty, topics, timePerQuestion, type }) => {
    const prompt = `Generate a quiz with ${numQuestions} questions.
Difficulty: ${difficulty}
Topics: ${topics.join(', ')}
Time per question: ${timePerQuestion} seconds
Type: ${type}`;

    const response = await llm.invoke(prompt);
    return response.content;
  },
  {
    name: 'QuizGeneratorTool',
    description: 'Generates a quiz based on the provided settings.',
    schema: z.object({
      numQuestions: z.number(),
      difficulty: z.string(),
      topics: z.array(z.string()),
      timePerQuestion: z.number(),
      type: z.string(),
    }),
  }
);

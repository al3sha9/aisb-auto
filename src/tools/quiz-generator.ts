
import { tool } from '@langchain/core/tools';
import { llm } from '../lib/groq-client';
import { z } from 'zod';

export const quizGeneratorTool = tool(
  async (input) => {
    const { numQuestions, difficulty, topics, timePerQuestion, type } = input as {
      numQuestions: number;
      difficulty: string;
      topics: string[];
      timePerQuestion: number;
      type: string;
    };
    const prompt = `Generate a quiz with ${numQuestions} ${type} questions about ${topics.join(', ')}.
Difficulty level: ${difficulty}
Time per question: ${timePerQuestion} seconds

IMPORTANT: Return ONLY a valid JSON array of question objects, with no additional text or explanation.

Each question object should have this exact structure:
{
  "question_text": "The question text",
  "options": [${type === 'multiple-choice' ? '"option1", "option2", "option3", "option4"' : '"True", "False"'}],
  "correct_answer": ${type === 'multiple-choice' ? '"0"' : '"true" or "false"'}
}

Generate exactly ${numQuestions} questions in this format as a JSON array.`;

    try {
      const response = await llm.invoke(prompt);
      console.log('LLM Response:', response.content);
      return response.content;
    } catch (error) {
      console.error('Error in quiz generator tool:', error);
      throw new Error(`Failed to generate quiz: ${error instanceof Error ? error.message : String(error)}`);
    }
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

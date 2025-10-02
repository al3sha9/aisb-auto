
import { quizGeneratorTool } from "../tools/quiz-generator";

// Simplified quiz generator that directly uses the tool
export const quizGeneratorAgent = {
  async invoke({ input }: { input: string }) {
    // Parse the input to extract parameters
    const numQuestions = parseInt(input.match(/(\d+) questions/)?.[1] || "5");
    const difficulty = input.match(/Difficulty: (\w+)/)?.[1] || "MEDIUM";
    const topicsMatch = input.match(/Topics: ([^,\n]+)/)?.[1];
    const topics = topicsMatch ? topicsMatch.split(',').map(t => t.trim()) : ["General"];
    const timePerQuestion = parseInt(input.match(/Time per question: (\d+)/)?.[1] || "60");
    const type = input.match(/Type: ([^\n]+)/)?.[1] || "multiple-choice";

    const result = await quizGeneratorTool.invoke({
      numQuestions,
      difficulty,
      topics,
      timePerQuestion,
      type
    });

    return { output: result };
  }
};

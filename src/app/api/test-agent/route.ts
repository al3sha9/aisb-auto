
import { NextRequest, NextResponse } from "next/server";
import { quizGeneratorAgent } from "@/agents/quiz-generator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { numQuestions, difficulty, topics, timePerQuestion, type } = body;

    const result = await quizGeneratorAgent.invoke({
      input: `Generate a quiz with ${numQuestions} questions.
Difficulty: ${difficulty}
Topics: ${topics.join(', ')}
Time per question: ${timePerQuestion} seconds
Type: ${type}`,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred' }, { status: 500 });
  }
}

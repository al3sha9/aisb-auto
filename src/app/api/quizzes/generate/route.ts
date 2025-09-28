
import { NextRequest, NextResponse } from "next/server";
import { quizGeneratorAgent } from "@/agents/quiz-generator";
import { supabase } from "@/lib/supabase-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { quizId, numQuestions, difficulty, topics, timePerQuestion, type } = body;

    const result = await quizGeneratorAgent.invoke({
      input: `Generate a quiz with ${numQuestions} questions.
Difficulty: ${difficulty}
Topics: ${topics.join(', ')}
Time per question: ${timePerQuestion} seconds
Type: ${type}`,
    });

    const questions = JSON.parse(result.output);

    const questionsWithQuizId = questions.map((q: any) => ({ ...q, quiz_id: quizId }));

    const { error } = await supabase.from("questions").insert(questionsWithQuizId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

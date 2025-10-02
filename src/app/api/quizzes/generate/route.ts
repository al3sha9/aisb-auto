
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

    const outputString = typeof result.output === 'string' ? result.output : JSON.stringify(result.output);
    console.log('Raw LLM output:', outputString);
    
    let questions;
    try {
      questions = JSON.parse(outputString);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.log('Attempting to extract JSON from response...');
      
      // Try to extract JSON array from the response
      const jsonMatch = outputString.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse questions from LLM response');
      }
    }

    console.log('Parsed questions:', questions);

    if (!Array.isArray(questions)) {
      throw new Error('Expected questions to be an array');
    }

    const questionsWithQuizId = questions.map((q: { question_text: string; options: string[]; correct_answer: string }) => ({ 
      ...q, 
      quiz_id: quizId 
    }));

    console.log('Questions to insert:', questionsWithQuizId);

    const { error } = await supabase.from("questions").insert(questionsWithQuizId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}


"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function QuizDetailsPage() {
  const params = useParams();
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data, error } = await supabase
          .from("quizzes")
          .select("*, questions(*)")
          .eq("id", params.quizId)
          .single();

        if (error) {
          throw error;
        }

        setQuiz(data);
      } catch (error) {
        toast.error(`Failed to fetch quiz: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (params.quizId) {
      fetchQuiz();
    }
  }, [params.quizId]);

  const handleGenerateQuestions = async () => {
    setGenerating(true);
    const toastId = toast.loading("Generating questions...");

    try {
      const response = await fetch("/api/quizzes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId: quiz.id,
          numQuestions: quiz.num_questions,
          difficulty: quiz.difficulty,
          topics: quiz.topics,
          timePerQuestion: quiz.time_per_question,
          type: quiz.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate questions");
      }

      toast.success("Questions generated successfully!", { id: toastId });
      // Refresh the quiz data
      const { data, error } = await supabase
        .from("quizzes")
        .select("*, questions(*)")
        .eq("id", params.quizId)
        .single();

      if (error) {
        throw error;
      }

      setQuiz(data);
    } catch (error) {
      toast.error(`Failed to generate questions: ${error.message}`, { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!quiz) {
    return <div>Quiz not found</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{quiz.name}</h1>
      <div className="space-y-4">
        <p><span className="font-bold">Difficulty:</span> {quiz.difficulty}</p>
        <p><span className="font-bold">Topics:</span> {quiz.topics.join(", ")}</p>
        <p><span className="font-bold">Number of Questions:</span> {quiz.num_questions}</p>
        <p><span className="font-bold">Time Per Question:</span> {quiz.time_per_question} seconds</p>
        <p><span className="font-bold">Quiz Type:</span> {quiz.type}</p>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Questions</h2>
        {quiz.questions.length > 0 ? (
          <ul className="space-y-4">
            {quiz.questions.map((q: any) => (
              <li key={q.id} className="border p-4 rounded">
                <p className="font-bold">{q.question_text}</p>
                <ul className="list-disc pl-5 mt-2">
                  {q.options.map((opt: string, index: number) => (
                    <li key={index} className={opt === q.correct_answer ? "text-green-500" : ""}>{opt}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 border rounded">
            <p className="mb-4">No questions have been generated for this quiz yet.</p>
            <Button onClick={handleGenerateQuestions} disabled={generating}>
              {generating ? "Generating..." : "Generate Questions with AI"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

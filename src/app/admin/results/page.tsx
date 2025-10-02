
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface ResultAnswer {
  id: number;
  // Add other answer properties as needed
}

interface Result {
  quizName: string;
  studentName: string;
  studentEmail: string;
  score: number;
  answers: ResultAnswer[];
}

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data, error } = await supabase
          .from("answers")
          .select("*, students(name, email), questions(quizzes(name))");

        if (error) {
          throw error;
        }

        // Group results by student and quiz
        const groupedResults = data.reduce((acc, answer) => {
          const key = `${answer.students.email}-${answer.questions.quizzes.name}`;
          if (!acc[key]) {
            acc[key] = {
              studentName: answer.students.name,
              studentEmail: answer.students.email,
              quizName: answer.questions.quizzes.name,
              answers: [],
              score: 0,
            };
          }
          acc[key].answers.push(answer);
          if (answer.is_correct) {
            acc[key].score++;
          }
          return acc;
        }, {});

        setResults(Object.values(groupedResults));
      } catch (error) {
        toast.error(`Failed to fetch results: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const handleScoreAndNotify = async () => {
    setScoring(true);
    const toastId = toast.loading("Scoring and notifying...");

    try {
      const response = await fetch("/api/quizzes/score-and-notify", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to score and notify");
      }

      toast.success("Scoring and notification complete!", { id: toastId });
    } catch (error) {
      toast.error(`Failed to score and notify: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: toastId });
    } finally {
      setScoring(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quiz Results</h1>
        <Button onClick={handleScoreAndNotify} disabled={scoring}>
          {scoring ? "Scoring..." : "Score and Notify Top 5"}
        </Button>
      </div>
      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <h2 className="text-xl font-bold">{result.quizName}</h2>
            <p className="text-lg">{result.studentName} ({result.studentEmail})</p>
            <p className="text-lg">Score: {result.score} / {result.answers.length}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

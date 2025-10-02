
"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function TakeQuizPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student');
  
  const [quiz, setQuiz] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch quiz data
        const { data: quizData, error: quizError } = await supabase
          .from("quizzes")
          .select("*, questions(*)")
          .eq("id", params.quizId)
          .single();

        if (quizError) {
          throw quizError;
        }

        setQuiz(quizData);
        setTimeLeft(quizData.time_per_question);

        // Fetch student data if studentId is provided
        if (studentId) {
          const { data: studentData, error: studentError } = await supabase
            .from("students")
            .select("name, email")
            .eq("id", studentId)
            .single();

          if (studentError) {
            console.warn('Student not found:', studentError.message);
          } else {
            setStudent(studentData);
          }
        }
      } catch (error) {
        toast.error(`Failed to fetch quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    if (params.quizId) {
      fetchData();
    }
  }, [params.quizId, studentId]);

  useEffect(() => {
    if (timeLeft === 0 && quiz) {
      handleNextQuestion();
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quiz]);

  const handleNextQuestion = async () => {
    // Save the answer
    if (selectedAnswer) {
      const { error } = await supabase.from("answers").insert([
        {
          student_id: studentId ? parseInt(studentId) : null,
          question_id: quiz.questions[currentQuestionIndex].id,
          answer_text: selectedAnswer,
          is_correct: selectedAnswer === quiz.questions[currentQuestionIndex].correct_answer,
        },
      ]);

      if (error) {
        toast.error(`Failed to save answer: ${error.message}`);
      }
    }

    // Move to the next question
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setTimeLeft(quiz.time_per_question);
    } else {
      // Quiz finished
      toast.success("Quiz finished!");
      // TODO: Redirect to results page
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!quiz) {
    return <div>Quiz not found</div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="container mx-auto py-10">
      {student && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            🎉 Welcome, {student.name}!
          </h2>
          <p className="text-green-700">
            Congratulations! Your form has been selected. You have <strong>{quiz.time_per_question} seconds</strong> to answer each question. 
            Good luck! 🍀
          </p>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-6">{quiz.name}</h1>
      <div className="border p-8 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Question {currentQuestionIndex + 1} of {quiz.questions.length}</h2>
          <div className={`text-xl font-bold px-4 py-2 rounded-lg ${
            timeLeft <= 5 ? 'bg-red-100 text-red-800' : 
            timeLeft <= 10 ? 'bg-yellow-100 text-yellow-800' : 
            'bg-blue-100 text-blue-800'
          }`}>
            ⏰ {timeLeft}s
          </div>
        </div>
        <p className="text-lg mb-6">{currentQuestion.question_text}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option: string, index: number) => (
            <Button
              key={index}
              variant={selectedAnswer === option ? "default" : "outline"}
              onClick={() => setSelectedAnswer(option)}
              className="w-full h-auto text-wrap p-4"
            >
              {option}
            </Button>
          ))}
        </div>
        <div className="mt-8 flex justify-end">
          <Button onClick={handleNextQuestion} disabled={!selectedAnswer}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

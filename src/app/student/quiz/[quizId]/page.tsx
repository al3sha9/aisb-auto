
"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertTriangle, Trophy } from "lucide-react";
import toast from "react-hot-toast";

interface Question {
  id: number;
  question_text: string;
  options: string[];
  correct_answer: string;
}

interface Quiz {
  id: number;
  name: string;
  time_per_question: number;
  questions: Question[];
}

interface Student {
  id: number;
  name: string;
  email: string;
}

type QuizState = 'instructions' | 'active' | 'completed';

function StudentQuizContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student');
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(10); // 10 seconds per question
  const [loading, setLoading] = useState(true);
  const [quizState, setQuizState] = useState<QuizState>('instructions');
  const [answers, setAnswers] = useState<string[]>([]);

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
        // Always use 10 seconds per question regardless of database value

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
            setStudent({
              id: 0, // Placeholder since we don't use the id
              name: studentData.name,
              email: studentData.email
            });
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

  const handleNextQuestion = useCallback(async () => {
    if (!quiz) return;
    
    // Save the answer
    const answerToSave = selectedAnswer || '';
    setAnswers(prev => [...prev, answerToSave]);
    
    if (answerToSave) {
      const { error } = await supabase.from("answers").insert([
        {
          student_id: studentId ? parseInt(studentId) : null,
          question_id: quiz.questions[currentQuestionIndex].id,
          answer_text: answerToSave,
          is_correct: answerToSave === quiz.questions[currentQuestionIndex].correct_answer,
        },
      ]);

      if (error) {
        console.error('Failed to save answer:', error.message);
      }
    }

    // Move to the next question
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setTimeLeft(10); // Always 10 seconds
    } else {
      // Quiz finished
      setQuizState('completed');
    }
  }, [quiz, selectedAnswer, studentId, currentQuestionIndex, setAnswers, setQuizState]);

  const startQuiz = () => {
    setQuizState('active');
    setTimeLeft(10);
  };

  useEffect(() => {
    if (quizState !== 'active') return;
    
    if (timeLeft === 0 && quiz) {
      handleNextQuestion();
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quiz, handleNextQuestion, quizState]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-4">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle className="text-destructive">Assessment Not Found</CardTitle>
            <CardDescription>
              The requested assessment could not be found or may have been removed.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Instructions Screen
  if (quizState === 'instructions') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI Skill Bridge</h1>
                <p className="text-muted-foreground">Assessment Platform</p>
              </div>
              {student && (
                <Badge variant="secondary" className="text-sm">
                  {student.name}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold text-foreground">
                  {quiz.name}
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  {student ? `Welcome ${student.name}! ` : ''}
                  You have been selected to participate in this assessment.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Assessment Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{quiz.questions.length}</div>
                    <div className="text-sm text-muted-foreground">Questions</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">10s</div>
                    <div className="text-sm text-muted-foreground">Per Question</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {Math.ceil(quiz.questions.length * 10 / 60)}m
                    </div>
                    <div className="text-sm text-muted-foreground">Total Time</div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                  <h3 className="font-semibold text-amber-900 mb-3 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Important Instructions
                  </h3>
                  <ul className="space-y-2 text-amber-800 text-sm">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Each question has a 10-second time limit
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Questions will automatically advance when time expires
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Once started, the assessment cannot be paused or restarted
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Ensure you have a stable internet connection
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Answer as quickly and accurately as possible
                    </li>
                  </ul>
                </div>

                {/* Start Button */}
                <div className="text-center pt-4">
                  <Button 
                    onClick={startQuiz} 
                    size="lg" 
                    className="w-full md:w-auto px-12 py-4 text-lg font-semibold"
                  >
                    Start Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Completed Screen
  if (quizState === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-2xl mx-4">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">
              Assessment Completed
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Thank you for participating in the assessment
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <div className="bg-slate-50 rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2">Assessment Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-2xl font-bold text-primary">{quiz.questions.length}</div>
                  <div className="text-muted-foreground">Questions Answered</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{answers.length}</div>
                  <div className="text-muted-foreground">Responses Recorded</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 text-muted-foreground">
              <p>Your responses have been successfully recorded and are now being processed.</p>
              <p>Results will be available after all participants have completed the assessment.</p>
              <p className="font-medium text-foreground">You may now close this window.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active Quiz Screen
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">{quiz.name}</h1>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Progress value={progress} className="w-32" />
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-semibold ${
                timeLeft <= 3 ? 'bg-red-100 text-red-700' : 
                timeLeft <= 6 ? 'bg-amber-100 text-amber-700' : 
                'bg-blue-100 text-blue-700'
              }`}>
                <Clock className="h-4 w-4" />
                <span>{timeLeft}s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold text-foreground leading-relaxed">
                {currentQuestion.question_text}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option: string, index: number) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === option ? "default" : "outline"}
                    onClick={() => setSelectedAnswer(option)}
                    className="w-full justify-start text-left h-auto p-4 text-wrap hover:bg-primary/10 hover:border-primary/20"
                    disabled={timeLeft === 0}
                  >
                    <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mr-3 text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </Button>
                ))}
              </div>
              
              <div className="mt-8 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {selectedAnswer ? 'Answer selected' : 'Select an answer above'}
                </div>
                <Button 
                  onClick={handleNextQuestion} 
                  disabled={!selectedAnswer && timeLeft > 0}
                  variant={selectedAnswer ? "default" : "outline"}
                >
                  {currentQuestionIndex === quiz.questions.length - 1 ? 'Complete Assessment' : 'Next Question'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function StudentQuizPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-10">Loading quiz...</div>}>
      <StudentQuizContent />
    </Suspense>
  );
}

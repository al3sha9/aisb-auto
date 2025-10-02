
"use client"
  import { supabase } from "@/lib/supabase-client";

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Loader2,
  Mail
} from "lucide-react"

// Interfaces for quiz and questions

interface GenerationResult {
  quiz?: {
    name: string;
  };
  questions_generated?: number;
  quiz_id?: number;
}

interface Question {
  id: number;
  question_text: string;
  options: string[];
  correct_answer: string;
}

interface Quiz {
  id: number;
  name: string;
  difficulty: string;
  topics: string[];
  num_questions: number;
  time_per_question: number;
  is_active?: boolean;
}

export default function QuizDetailsPage() {
  const [generating, setGenerating] = useState(false)
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [sending, setSending] = useState(false)
  // const [activating, setActivating] = useState(false) // Disabled until DB column is added
  const [quizConfig, setQuizConfig] = useState({
    title: "AI Generated Quiz",
    topics: "AI, Machine Learning, Neural Networks",
    difficulty: "MEDIUM",
    num_questions: 5,
    time_limit: 30
  })

  const fetchQuestions = async (quizId: number) => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('id');
      
      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  }

  // const fetchQuiz = async (quizId: number) => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('quizzes')
  //       .select('*')
  //       .eq('id', quizId)
  //       .single();
  //     
  //     if (error) throw error;
  //     setCurrentQuiz(data);
  //     await fetchQuestions(quizId);
  //   } catch (error) {
  //     console.error('Error fetching quiz:', error);
  //   }
  // }

  useEffect(() => {
    // Quiz generation page - fetch latest quiz if available
    const fetchLatestQuiz = async () => {
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (!error && data) {
          setCurrentQuiz(data);
          await fetchQuestions(data.id);
        }
      } catch {
        // No quizzes exist yet, that's fine
        console.log('No existing quizzes found');
      }
    }
    
    fetchLatestQuiz();
  }, [])

  const handleActivateQuiz = async () => {
    if (!currentQuiz) return;
    
    // For now, just toggle the local state since is_active column doesn't exist in DB
    setCurrentQuiz({
      ...currentQuiz,
      is_active: !currentQuiz.is_active
    });
    
    // TODO: Uncomment when is_active column is added to database
    /*
    setActivating(true);
    try {
      const response = await fetch('/api/quizzes/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: currentQuiz.id,
          isActive: !currentQuiz.is_active
        })
      });

      if (response.ok) {
        setCurrentQuiz({
          ...currentQuiz,
          is_active: !currentQuiz.is_active
        });
      } else {
        throw new Error('Failed to activate quiz');
      }
    } catch (error) {
      console.error('Error activating quiz:', error);
    } finally {
      setActivating(false);
    }
    */
  }

  const handleSendInvitations = async () => {
    if (!currentQuiz) return;
    
    setSending(true);
    try {
      const response = await fetch('/api/quizzes/send-invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: currentQuiz.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Quiz invitations sent successfully!
Emails sent: ${result.emails_sent}
Failed: ${result.emails_failed}
Total students: ${result.total_students}`);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send invitations');
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast.error(`Failed to send invitations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSending(false);
    }
  }

  const handleGenerateQuiz = async () => {
    setGenerating(true)
    setGenerationError(null)
    setGenerationResult(null)

    try {
      // Create quiz first
      const { data: newQuiz, error: quizError } = await supabase
        .from('quizzes')
        .insert([{
          name: quizConfig.title,
          difficulty: quizConfig.difficulty.toLowerCase(),
          topics: quizConfig.topics.split(',').map(t => t.trim()),
          time_per_question: quizConfig.time_limit,
          num_questions: quizConfig.num_questions,
          type: 'multiple_choice'
        }])
        .select()
        .single();

      if (quizError) {
        throw new Error(`Failed to create quiz: ${quizError.message}`);
      }

      const response = await fetch('/api/quizzes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: newQuiz.id,
          numQuestions: quizConfig.num_questions,
          difficulty: quizConfig.difficulty,
          topics: quizConfig.topics.split(',').map(t => t.trim()),
          timePerQuestion: quizConfig.time_limit,
          type: "multiple-choice"
        })
      })

      if (response.ok) {
        setGenerationResult({
          quiz: { name: newQuiz.name },
          questions_generated: quizConfig.num_questions,
          quiz_id: newQuiz.id
        })
        // Fetch the newly created quiz and its questions
        setCurrentQuiz(newQuiz);
        await fetchQuestions(newQuiz.id);
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Generation failed')
      }
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quiz Details</h1>
          <p className="text-muted-foreground mt-2">
            View and manage quiz configuration and questions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Quiz
          </Button>
          {currentQuiz && questions.length > 0 && (
            <Button
              onClick={handleSendInvitations}
              disabled={sending}
              variant="default"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Quiz Invitations
                </>
              )}
            </Button>
          )}
          <Button
            onClick={() => window.location.href = '/admin/quizzes'}
            variant="outline"
          >
            View All Quizzes
          </Button>
        </div>
      </div>

      {/* AI Quiz Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Quiz
          </CardTitle>
          <CardDescription>
            Create quiz questions automatically using AI based on your student data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                value={quizConfig.title}
                onChange={(e) => setQuizConfig({...quizConfig, title: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="topics">Topics (comma-separated)</Label>
              <Input
                id="topics"
                value={quizConfig.topics}
                onChange={(e) => setQuizConfig({...quizConfig, topics: e.target.value})}
                placeholder="AI, Machine Learning, Python"
              />
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                className="w-full p-2 border rounded"
                value={quizConfig.difficulty}
                onChange={(e) => setQuizConfig({...quizConfig, difficulty: e.target.value})}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div>
              <Label htmlFor="num_questions">Number of Questions</Label>
              <Input
                id="num_questions"
                type="number"
                min="1"
                max="20"
                value={quizConfig.num_questions}
                onChange={(e) => setQuizConfig({...quizConfig, num_questions: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <Button
            onClick={handleGenerateQuiz}
            disabled={generating}
            className="w-full"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Quiz Questions
              </>
            )}
          </Button>

          {generationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Generation Failed</AlertTitle>
              <AlertDescription>{generationError}</AlertDescription>
            </Alert>
          )}

          {generationResult && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Quiz Generated Successfully!</AlertTitle>
              <AlertDescription>
                Created quiz &quot;{generationResult.quiz?.name}&quot; with {generationResult.questions_generated} questions.
                Quiz ID: {generationResult.quiz_id}
                <br />
                <Button
                  className="mt-2"
                  size="sm"
                  onClick={() => window.location.href = `/admin/quiz/${generationResult.quiz_id}`}
                >
                  View Quiz Details
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Quiz Overview */}
      {currentQuiz && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {currentQuiz.name}
                </CardTitle>
                <CardDescription>
                  Quiz details and performance metrics
                </CardDescription>
              </div>
              <Badge variant={currentQuiz.is_active ? "default" : "secondary"}>
                <Clock className="h-3 w-3 mr-1" />
                {currentQuiz.is_active ? "Active" : "Draft"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Quiz Info</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">Questions:</span>
                    <span className="text-sm font-medium">{questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Time per Question:</span>
                    <span className="text-sm font-medium">{currentQuiz.time_per_question}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Difficulty:</span>
                    <span className="text-sm font-medium capitalize">{currentQuiz.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Topics:</span>
                    <span className="text-sm font-medium">{currentQuiz.topics.join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Participation</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">Status:</span>
                    <span className="text-sm font-medium">{currentQuiz.is_active ? 'Active' : 'Draft'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Questions Generated:</span>
                    <span className="text-sm font-medium">{questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Ready to Launch:</span>
                    <span className="text-sm font-medium">{questions.length > 0 ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Configuration</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">Quiz ID:</span>
                    <span className="text-sm font-medium">{currentQuiz.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Type:</span>
                    <span className="text-sm font-medium">Multiple Choice</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Questions</CardTitle>
              <CardDescription>
                Review all questions in this quiz
              </CardDescription>
            </div>
            {currentQuiz && questions.length > 0 && (
              <Button
                onClick={handleActivateQuiz}
                variant={currentQuiz.is_active ? "destructive" : "default"}
              >
                {currentQuiz.is_active ? "Deactivate Quiz" : "Activate Quiz"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.length > 0 ? (
              questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    <Badge variant="outline">{currentQuiz?.difficulty || 'Medium'}</Badge>
                  </div>
                  <p className="text-sm mb-3">{question.question_text}</p>
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Options:</div>
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`text-sm p-2 rounded border ${
                          question.correct_answer === optionIndex.toString() 
                            ? 'bg-green-50 border-green-200 text-green-800' 
                            : 'bg-gray-50'
                        }`}
                      >
                        {String.fromCharCode(65 + optionIndex)}. {option}
                        {question.correct_answer === optionIndex.toString() && (
                          <CheckCircle className="h-4 w-4 inline-block ml-2 text-green-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Generate a quiz to see questions here.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Quiz Management</AlertTitle>
        <AlertDescription>
          This quiz was automatically generated. You can review, edit, or regenerate questions as needed.
        </AlertDescription>
      </Alert>
    </div>
  )
}


"use client"
  import { supabase } from "@/lib/supabase-client";

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

// Mock quiz data
const quizDetails = {
  id: "QUIZ001",
  title: "AI Fundamentals Assessment",
  description: "Comprehensive quiz covering basic AI concepts and applications",
  status: "active",
  createdAt: "2025-09-25",
  totalQuestions: 15,
  timeLimit: 30, // minutes
  studentsInvited: 25,
  studentsCompleted: 12,
  averageScore: 78.5
}

// Unused interfaces and functions removed

interface GenerationResult {
  quiz?: {
    name: string;
  };
  questions_generated?: number;
  quiz_id?: number;
}

export default function QuizDetailsPage() {
  const [generating, setGenerating] = useState(false)
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [quizConfig, setQuizConfig] = useState({
    title: "AI Generated Quiz",
    topics: "AI, Machine Learning, Neural Networks",
    difficulty: "MEDIUM",
    num_questions: 5,
    time_limit: 30
  })


  useEffect(() => {
    // Quiz generation page - no need to fetch existing quizzes
  }, [])

  // Activation functionality disabled - database doesn't have is_active column
  // const handleActivateQuiz = async () => { ... }

  // Email functionality removed for this page

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
        const result = await response.json()
        setGenerationResult({
          ...result,
          quiz_id: newQuiz.id
        })
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
          <Button
            onClick={() => window.location.href = '/admin/quizzes'}
            variant="default"
          >
            <Mail className="h-4 w-4 mr-2" />
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generate Quiz
              </CardTitle>
              <CardDescription>
                Generate a quiz to see details
              </CardDescription>
            </div>
            {false && (
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                Draft
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Quiz Info</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Questions:</span>
                  <span className="text-sm font-medium">{quizDetails.totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Time Limit:</span>
                  <span className="text-sm font-medium">{quizDetails.timeLimit} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Created:</span>
                  <span className="text-sm font-medium">{quizDetails.createdAt}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Participation</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Invited:</span>
                  <span className="text-sm font-medium">{quizDetails.studentsInvited} students</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Completed:</span>
                  <span className="text-sm font-medium">{quizDetails.studentsCompleted} students</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Completion Rate:</span>
                  <span className="text-sm font-medium">
                    {Math.round((quizDetails.studentsCompleted / quizDetails.studentsInvited) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Performance</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Average Score:</span>
                  <span className="text-sm font-medium">{quizDetails.averageScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pass Rate:</span>
                  <span className="text-sm font-medium">85%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
          <CardDescription>
            Review all questions in this quiz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">Generate a quiz to see questions here.</p>
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

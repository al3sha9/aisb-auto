"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Play,
  Eye,
  Edit,
  Sparkles,
  Loader2,
  Bot,
  Square,
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

// Question interface
interface Question {
  id: number;
  type: 'multiple_choice' | 'true_false';
  question: string;
  options?: string[];
  correctAnswer: number | boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

const getDifficultyBadge = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Easy</Badge>
    case 'medium':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>
    case 'hard':
      return <Badge variant="secondary" className="bg-red-100 text-red-800">Hard</Badge>
    default:
      return <Badge variant="secondary">{difficulty}</Badge>
  }
}

export default function QuizDetailsPage() {
  const [generating, setGenerating] = useState(false)
  const [generationResult, setGenerationResult] = useState<any>(null)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [activating, setActivating] = useState(false)
  const [sendingEmails, setSendingEmails] = useState(false)
  const [quizConfig, setQuizConfig] = useState({
    title: "AI Generated Quiz",
    description: "Generated using CrewAI agents",
    topics: "AI, Machine Learning, Neural Networks",
    difficulty: "MEDIUM",
    num_questions: 5,
    time_limit: 30
  })

  const fetchQuizzes = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8000/api/admin/quizzes', {
        headers: {
          'Authorization': 'Bearer dummy-token'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setQuizzes(data)
        if (data.length > 0) {
          setSelectedQuiz(data[data.length - 1]) // Show latest quiz
          fetchQuestions(data[data.length - 1].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestions = async (quizId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/quizzes/${quizId}/questions`, {
        headers: {
          'Authorization': 'Bearer dummy-token'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setQuestions(data)
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error)
    }
  }

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const handleActivateQuiz = async () => {
    if (!selectedQuiz) return
    
    setActivating(true)
    try {
      const response = await fetch(`http://localhost:8000/api/admin/quizzes/${selectedQuiz.id}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer dummy-token',
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Update the selected quiz status
        setSelectedQuiz({
          ...selectedQuiz,
          is_active: data.is_active
        })
        // Also update in quizzes list
        setQuizzes(quizzes.map(quiz => 
          quiz.id === selectedQuiz.id 
            ? { ...quiz, is_active: data.is_active }
            : quiz
        ))
      }
    } catch (error) {
      console.error('Failed to activate quiz:', error)
    } finally {
      setActivating(false)
    }
  }

  const handleSendEmailInvitations = async () => {
    if (!selectedQuiz || !selectedQuiz.is_active) {
      alert('Quiz must be activated before sending invitations')
      return
    }

    setSendingEmails(true)
    try {
      const response = await fetch(`http://localhost:8000/api/admin/quizzes/${selectedQuiz.id}/send-invitations`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer dummy-token',
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Email invitations sent! 
        📧 Sent: ${data.emails_sent}
        ❌ Failed: ${data.emails_failed}
        👥 Total Students: ${data.total_students}`)
      } else {
        const error = await response.json()
        alert(`Failed to send invitations: ${error.detail || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to send email invitations:', error)
      alert('Failed to send email invitations. Please try again.')
    } finally {
      setSendingEmails(false)
    }
  }

  const handleGenerateQuiz = async () => {
    setGenerating(true)
    setGenerationError(null)
    setGenerationResult(null)

    try {
      const response = await fetch('http://localhost:8000/api/admin/quizzes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dummy-token'
        },
        body: JSON.stringify({
          ...quizConfig,
          topics: quizConfig.topics.split(',').map(t => t.trim())
        })
      })

      if (response.ok) {
        const result = await response.json()
        setGenerationResult(result)
      } else {
        const error = await response.text()
        throw new Error(error)
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
            onClick={handleActivateQuiz}
            disabled={activating || !selectedQuiz}
            variant={selectedQuiz?.is_active ? "secondary" : "default"}
          >
            {selectedQuiz?.is_active ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                {activating ? "Deactivating..." : "Deactivate Quiz"}
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                {activating ? "Activating..." : "Activate Quiz"}
              </>
            )}
          </Button>
          <Button 
            onClick={handleSendEmailInvitations}
            disabled={sendingEmails || !selectedQuiz?.is_active}
            variant="outline"
          >
            {sendingEmails ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Emails...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Email Invitations
              </>
            )}
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
                Created quiz "{generationResult.quiz?.title}" with {generationResult.questions_generated} questions.
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
                {selectedQuiz ? selectedQuiz.title : "No Quiz Selected"}
              </CardTitle>
              <CardDescription>
                {selectedQuiz ? selectedQuiz.description : "Generate a quiz to see details"}
              </CardDescription>
            </div>
            {selectedQuiz && (
              <Badge variant={selectedQuiz.is_active ? 'default' : 'secondary'}>
                {selectedQuiz.is_active ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3 mr-1" />
                    Draft
                  </>
                )}
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
            {questions.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4 space-y-2">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">Q{index + 1}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{question.type.replace('_', ' ')}</p>
                  <p className="text-sm font-medium capitalize">{question.difficulty}</p>
                  <h4 className="font-medium text-base mt-2">{question.question}</h4>
                </div>
                
                {question.type === 'multiple_choice' && question.options && (
                  <div className="mt-3 space-y-1">
                    {question.options.map((option: string, optIndex: number) => (
                      <div key={optIndex} className="flex items-center space-x-2">
                        <span className="font-medium text-sm">
                          {String.fromCharCode(65 + optIndex)}.
                        </span>
                        <span className={`text-sm ${
                          optIndex === question.correctAnswer ? 'font-medium text-green-700' : ''
                        }`}>
                          {option}
                        </span>
                        {optIndex === question.correctAnswer && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'true_false' && (
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">A.</span>
                      <span className={`text-sm ${
                        question.correctAnswer === true ? 'font-medium text-green-700' : ''
                      }`}>
                        True
                      </span>
                      {question.correctAnswer === true && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">B.</span>
                      <span className={`text-sm ${
                        question.correctAnswer === false ? 'font-medium text-green-700' : ''
                      }`}>
                        False
                      </span>
                      {question.correctAnswer === false && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
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

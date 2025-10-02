"use client"
import { supabase } from "@/lib/supabase-client";

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Trophy,
  User,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  UserCheck,
  Mail
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface QuizResult {
  id: number
  student: {
    name: string
    email: string
  }
  quiz: {
    name: string
  }
  score: number
  total_questions: number
  percentage: number
  time_taken_minutes: number | null
  completed_at: string
}

export default function QuizResultsPage() {
  const [results, setResults] = useState<QuizResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selecting, setSelecting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<QuizResult[]>([])
  const [emailsSent, setEmailsSent] = useState(false)


  useEffect(() => {
    const fetchResults = async () => {
      try {
        // First, get all answers with student and quiz information
        const { data: answersData, error: answersError } = await supabase
          .from("answers")
          .select("*, students(name, email), questions(quiz_id, quizzes(name))");

        if (answersError) {
          throw answersError;
        }

        // Get quiz information with total question counts
        const { data: quizzesData, error: quizzesError } = await supabase
          .from("quizzes")
          .select("id, name, num_questions");

        if (quizzesError) {
          throw quizzesError;
        }

        // Create a map of quiz_id to quiz info for easy lookup
        const quizMap = quizzesData.reduce((acc: any, quiz: any) => {
          acc[quiz.id] = quiz;
          return acc;
        }, {});

        // Group answers by student and quiz
        const studentQuizResults = answersData.reduce((acc: any, answer: any) => {
          const quizId = answer.questions.quiz_id;
          const key = `${answer.student_id}-${quizId}`;
          
          if (!acc[key]) {
            acc[key] = {
              student_id: answer.student_id,
              student: answer.students,
              quiz_id: quizId,
              quiz: {
                name: answer.questions.quizzes.name
              },
              correctAnswers: 0,
              totalAnswered: 0,
              completed_at: answer.created_at,
            };
          }
          
          acc[key].totalAnswered += 1;
          if (answer.is_correct) {
            acc[key].correctAnswers += 1;
          }
          
          // Keep the latest completion time
          if (new Date(answer.created_at) > new Date(acc[key].completed_at)) {
            acc[key].completed_at = answer.created_at;
          }
          
          return acc;
        }, {});

        // Format results for display
        const formattedResults = Object.values(studentQuizResults).map((result: any) => {
          const quiz = quizMap[result.quiz_id];
          const totalQuestions = quiz ? quiz.num_questions : result.totalAnswered;
          const score = result.correctAnswers;
          const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

          return {
            id: `${result.student_id}-${result.quiz_id}`,
            student: {
              name: result.student.name,
              email: result.student.email,
            },
            quiz: {
              name: result.quiz.name,
            },
            score: score,
            total_questions: totalQuestions,
            percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal place
            time_taken_minutes: null, // Not available in current schema
            completed_at: result.completed_at,
          };
        });

        setResults(formattedResults);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 90) {
      return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    } else if (percentage >= 80) {
      return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
    } else if (percentage >= 70) {
      return <Badge className="bg-yellow-100 text-yellow-800">Pass</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>
    }
  }

  const formatTime = (minutes: number | null) => {
    if (!minutes) return 'Time not recorded'
    return `${minutes}m`
  }

  const handleSelectTopStudents = async () => {
    setSelecting(true)
    setError(null)
    setSuccess(null)

    try {
      // Call API route to select top students and send emails
      const response = await fetch('/api/quizzes/score-and-notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // No specific body needed for now, as the API route fetches all answers
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to select top students')
      }

      // Assuming the API route handles the selection and email sending
      setSuccess(`Successfully initiated scoring and notification process. Top students will receive email invitations.`)
      setEmailsSent(true)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setSelecting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Calculate statistics
  const totalResults = results.length
  const averageScore = totalResults > 0
    ? (results.reduce((sum, result) => sum + result.percentage, 0) / totalResults)
    : 0
  const passRate = totalResults > 0
    ? (results.filter(result => result.percentage >= 70).length / totalResults) * 100
    : 0
  const topScore = totalResults > 0
    ? Math.max(...results.map(result => result.percentage))
    : 0

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Quiz Results</h1>
          <p className="text-muted-foreground">
            Overview of all quiz submissions and student performance
          </p>
        </div>
        <Button
          onClick={handleSelectTopStudents}
          disabled={selecting || totalResults === 0 || emailsSent}
          className="flex items-center gap-2"
        >
          <UserCheck className="h-4 w-4" />
          {selecting ? 'Selecting Students...' : emailsSent ? 'Students Selected' : 'Select Top 10% Students'}
        </Button>
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <Mail className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Selected Students Display */}
      {selectedStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Selected Top Students ({selectedStudents.length})
            </CardTitle>
            <CardDescription>
              These students have been invited to submit video applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedStudents.map((student) => (
                <div key={student.id} className="border rounded-lg p-3">
                  <div className="font-medium">{student.student?.name}</div>
                  <div className="text-sm text-muted-foreground">{student.student?.email}</div>
                  <div className="text-sm font-medium text-green-600">
                    Score: {student.score}/{student.total_questions} ({student.percentage.toFixed(1)}%)
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
                <p className="text-2xl font-bold">{totalResults}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{averageScore.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
                <p className="text-2xl font-bold">{passRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Top Score</p>
                <p className="text-2xl font-bold">{topScore.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Quiz Results
          </CardTitle>
          <CardDescription>
            Detailed results for all quiz submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totalResults === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No Results Yet</h3>
              <p className="text-sm text-muted-foreground">
                Quiz results will appear here once students complete their quizzes
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Quiz</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Time Taken</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{result.student?.name || 'Unknown Student'}</div>
                        <div className="text-sm text-muted-foreground">{result.student?.email || 'No email'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{result.quiz?.name || 'Untitled Quiz'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {result.score}/{result.total_questions}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{result.percentage.toFixed(1)}%</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(result.time_taken_minutes)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getScoreBadge(result.percentage)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(result.completed_at)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

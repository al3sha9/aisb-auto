"use client"

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
    title: string
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
        const token = localStorage.getItem('admin_token')
        if (!token) {
          setError('No authentication token found')
          return
        }

        const response = await fetch('http://localhost:8000/api/admin/quiz-results', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch results')
        }

        const data = await response.json()
        setResults(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [])

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
      const token = localStorage.getItem('admin_token')
      if (!token) {
        setError('No authentication token found')
        return
      }

      // Call CrewAI agent to select top 10% students
      const response = await fetch('http://localhost:8000/api/agents/select-top-students/execute', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          percentage: 10,
          video_topic: "Why you are the best candidate for AISB"
        })
      })

      if (!response.ok) {
        throw new Error('Failed to select top students')
      }

      const result = await response.json()
      setSelectedStudents(result.selected_students || [])
      setEmailsSent(true)
      setSuccess(`Successfully selected ${result.selected_students?.length || 0} top students and sent video submission invitations!`)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select students')
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
                      <div className="font-medium">{result.quiz?.title || 'Untitled Quiz'}</div>
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

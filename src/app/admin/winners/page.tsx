"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from '@/lib/supabase-client'
import { toast } from 'sonner'
import { 
  Trophy, 
  Medal, 
  Star,
  Crown,
  Play,
  Download,
  Eye,
  Mail,
  Loader2
} from "lucide-react"

interface Winner {
  position: number
  studentName: string
  studentId: string
  email: string
  videoTitle: string
  finalScore: number
  videoScore: number
  notified: boolean
  prize: string
  submissionId: string
}

const getPositionIcon = (position: number) => {
  switch (position) {
    case 1:
      return <Crown className="h-5 w-5 text-yellow-500" />
    case 2: 
      return <Medal className="h-5 w-5 text-gray-400" />
    case 3:
      return <Trophy className="h-5 w-5 text-amber-600" />
    default:
      return <Star className="h-5 w-5 text-muted-foreground" />
  }
}

const getPositionColor = (position: number) => {
  switch (position) {
    case 1:
      return "border-yellow-200 bg-yellow-50"
    case 2:
      return "border-gray-200 bg-gray-50" 
    case 3:
      return "border-amber-200 bg-amber-50"
    default:
      return "border-muted"
  }
}

export default function WinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)
  const [notifying, setNotifying] = useState(false)

  const fetchWinners = async () => {
    try {
      setLoading(true)
      
      // Get all processed video submissions with scores
      const { data: submissions, error } = await supabase
        .from('video_submissions')
        .select(`
          id,
          student_id,
          youtube_link,
          evaluation,
          created_at,
          students (name, email)
        `)
        .not('evaluation', 'is', null)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      // Parse scores and calculate top 5%
      const scoredSubmissions = submissions
        .map((submission: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
          let score = 0
          try {
            const evaluation = JSON.parse(submission.evaluation)
            score = evaluation.totalScore || 0
          } catch {
            score = 0
          }

          return {
            submissionId: submission.id,
            studentName: submission.students?.name || 'Unknown',
            studentId: submission.student_id?.toString() || 'N/A',
            email: submission.students?.email || 'No email',
            videoTitle: `Video by ${submission.students?.name || 'Student'}`,
            finalScore: score,
            videoScore: score,
            evaluation: submission.evaluation
          }
        })
        .filter(sub => sub.finalScore > 0) // Only include submissions with valid scores
        .sort((a, b) => b.finalScore - a.finalScore) // Sort by score descending

      // Calculate top 5% (minimum 1, maximum 10)
      const totalSubmissions = scoredSubmissions.length
      const top5PercentCount = Math.max(1, Math.min(10, Math.ceil(totalSubmissions * 0.05)))
      const topSubmissions = scoredSubmissions.slice(0, top5PercentCount)

      // Format as winners with positions and prizes
      const formattedWinners: Winner[] = topSubmissions.map((sub, index) => ({
        position: index + 1,
        studentName: sub.studentName,
        studentId: sub.studentId,
        email: sub.email,
        videoTitle: sub.videoTitle,
        finalScore: sub.finalScore,
        videoScore: sub.videoScore,
        notified: false, // TODO: Track notification status
        prize: getPrizeText(index + 1),
        submissionId: sub.submissionId
      }))

      setWinners(formattedWinners)
    } catch (error) {
      console.error('Error fetching winners:', error)
      toast.error('Failed to fetch winners')
    } finally {
      setLoading(false)
    }
  }

  const getPrizeText = (position: number): string => {
    switch (position) {
      case 1:
        return "First Place - Winner Certificate"
      case 2:
        return "Second Place - Achievement Certificate"
      case 3:
        return "Third Place - Recognition Certificate"
      default:
        return `Top ${Math.ceil(winners.length * 0.05 || 5)}% - Excellence Certificate`
    }
  }

  const handleNotifyAll = async () => {
    setNotifying(true)
    const toastId = toast.loading('Sending winner notifications...')

    try {
      const response = await fetch('/api/winners/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winners })
      })

      if (!response.ok) {
        throw new Error('Failed to send notifications')
      }

      toast.success('Winner notifications sent successfully!', { id: toastId })
      // Refresh data to update notification status
      await fetchWinners()
    } catch (error) {
      console.error('Error sending notifications:', error)
      toast.error('Failed to send notifications', { id: toastId })
    } finally {
      setNotifying(false)
    }
  }

  useEffect(() => {
    fetchWinners()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading winners...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contest Winners</h1>
          <p className="text-muted-foreground mt-2">
            Top {Math.ceil(winners.length)} students selected from video submissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
          <Button onClick={handleNotifyAll} disabled={notifying || winners.length === 0}>
            {notifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Notify All
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Contest Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Contest Summary
          </CardTitle>
          <CardDescription>
            Final results determined by CrewAI ranking agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{winners.length}</div>
              <div className="text-sm text-muted-foreground">Winners Selected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {winners.length > 0 ? Math.round(winners.reduce((acc, w) => acc + w.finalScore, 0) / winners.length) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{winners.length}</div>
              <div className="text-sm text-muted-foreground">Top Submissions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {winners.filter(w => w.notified).length}
              </div>
              <div className="text-sm text-muted-foreground">Notified</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Winners List */}
      <div className="space-y-4">
        {winners.map((winner) => (
          <Card key={winner.position} className={`${getPositionColor(winner.position)} border-2`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getPositionIcon(winner.position)}
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {winner.studentName}
                      <Badge variant="outline">{winner.studentId}</Badge>
                    </CardTitle>
                    <CardDescription>{winner.videoTitle}</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{winner.finalScore}%</div>
                  <div className="text-sm text-muted-foreground">Final Score</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Contact Information</div>
                    <div className="text-sm">{winner.email}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Prize</div>
                    <div className="text-sm font-medium text-green-700">{winner.prize}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Notification Status</div>
                    <Badge variant={winner.notified ? "default" : "secondary"}>
                      {winner.notified ? "✓ Notified" : "Pending"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Score Details</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Video Analysis Score:</span>
                        <span className="font-medium">{winner.videoScore}/100</span>
                      </div>
                      <div className="flex justify-between text-sm border-t pt-2">
                        <span className="font-medium">Final Score:</span>
                        <span className="font-bold">{winner.finalScore}/100</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Ranking</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{winner.position}</Badge>
                      <span className="text-sm text-muted-foreground">Top {Math.ceil((winner.position / winners.length) * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Video
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Certificate
                </Button>
                {!winner.notified && (
                  <Button size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Notification
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Ranking Information */}
      <Alert>
        <Trophy className="h-4 w-4" />
        <AlertTitle>AI-Powered Ranking</AlertTitle>
        <AlertDescription>
          Winners were selected using advanced AI algorithms that evaluate both quiz performance and video quality. 
          The CrewAI agents analyzed content relevance, presentation quality, and technical accuracy to determine the final rankings.
        </AlertDescription>
      </Alert>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            Complete the contest by notifying winners and distributing prizes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Send Winner Notifications
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Generate Certificates  
            </Button>
          </div>
          
          <Button variant="outline" className="w-full">
            <Play className="h-4 w-4 mr-2" />
            Start New Contest
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

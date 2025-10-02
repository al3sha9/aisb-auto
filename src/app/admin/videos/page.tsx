"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Video, 
  Search, 
  Play,
  Download,
  Eye,
  Star,
  Clock,
  CheckCircle,
  Trophy
} from "lucide-react"
import toast from "react-hot-toast"

interface VideoSubmission {
  id: string
  studentName: string
  studentId: string
  email: string
  videoUrl: string
  title: string
  fileSize: string
  duration: string
  submittedAt: string
  status: string
  score: number | null
  ranking: number | null
  analysis?: {
    summary: string
    score: number | null
  } | null
}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatSubmissionData = (submission: any): VideoSubmission => {
    let analysis = null
    let score = null
    
    // Parse the evaluation JSON if it exists
    if (submission.evaluation) {
      try {
        const evaluationData = JSON.parse(submission.evaluation)
        score = evaluationData.totalScore || null
        analysis = {
          summary: evaluationData.summary || 'Processed',
          score: evaluationData.totalScore || null
        }
      } catch (error) {
        console.error('Error parsing evaluation data:', error)
        analysis = {
          summary: submission.evaluation || 'Processed',
          score: null
        }
      }
    }
    
    return {
      id: submission.id,
      studentName: submission.students?.name || 'Unknown',
      studentId: submission.student_id?.toString() || 'N/A',
      email: submission.students?.email || 'No email',
      videoUrl: submission.youtube_link || '#',
      title: `Video by ${submission.students?.name || 'Student'}`,
      fileSize: 'N/A',
      duration: 'N/A',
      submittedAt: new Date(submission.created_at).toLocaleDateString(),
      status: submission.evaluation ? 'processed' : 'pending',
      score: score,
      ranking: null,
      analysis: analysis
    }
  }

const getStatusBadge = (status: string, ranking?: number | null) => {
  switch (status) {
    case 'reviewed':
      return (
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Reviewed
          </Badge>
          {ranking && ranking <= 3 && (
            <Badge variant="default" className="bg-yellow-100 text-yellow-800">
              <Trophy className="h-3 w-3 mr-1" />
              #{ranking}
            </Badge>
          )}
        </div>
      )
    case 'pending':
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>
    case 'processing':
      return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Processing</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function VideoSubmissionsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("video_submissions")
        .select(`
          id,
          student_id,
          youtube_link,
          transcript,
          evaluation,
          created_at,
          students (name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setSubmissions(data || [])
    } catch (error) {
      console.error('Error fetching submissions:', error)
      toast.error('Failed to fetch video submissions')
    } finally {
      setLoading(false)
    }
  }

  const handleProcessVideo = async (submissionId: string) => {
    setProcessing(true)
    const toastId = toast.loading('Processing video...')
    
    try {
      const response = await fetch('/api/videos/process', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId })
      })
      
      if (!response.ok) throw new Error('Failed to process video')
      
      await fetchSubmissions() // Refresh data
      toast.success('Video processed successfully!', { id: toastId })
    } catch (error) {
      console.error('Error processing video:', error)
      toast.error('Failed to process video', { id: toastId })
    } finally {
      setProcessing(false)
    }
  }

  const handleProcessVideos = async () => {
    setProcessing(true)
    const toastId = toast.loading('Processing all videos...')
    
    try {
      const unprocessedIds = submissions
        .filter(s => s.status !== 'processed')
        .map(s => s.id)
      
      if (unprocessedIds.length === 0) {
        toast.success('All videos are already processed!', { id: toastId })
        return
      }
      
      const response = await fetch('/api/videos/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionIds: unprocessedIds })
      })
      
      if (!response.ok) throw new Error('Failed to process videos')
      
      await fetchSubmissions() // Refresh data
      toast.success('Videos processed successfully!', { id: toastId })
    } catch (error) {
      console.error('Error processing videos:', error)
      toast.error('Failed to process videos', { id: toastId })
    } finally {
      setProcessing(false)
    }
  }

  const handleDownloadSummary = (submission: VideoSubmission) => {
    try {
      // Find the original submission data to get the full evaluation
      const originalSubmission = submissions.find(s => s.id === submission.id)
      let evaluationData = null
      
      if (originalSubmission?.evaluation) {
        try {
          evaluationData = JSON.parse(originalSubmission.evaluation)
        } catch {
          evaluationData = { summary: originalSubmission.evaluation }
        }
      }
      
      const summaryData = {
        submissionId: submission.id,
        studentName: submission.studentName,
        studentEmail: submission.email,
        videoUrl: submission.videoUrl,
        submittedAt: submission.submittedAt,
        status: submission.status,
        score: submission.score,
        analysis: evaluationData || submission.analysis,
        downloadedAt: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(summaryData, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `video-summary-${submission.studentName.replace(/\s+/g, '-')}-${submission.id}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Summary downloaded successfully!')
    } catch (error) {
      console.error('Error downloading summary:', error)
      toast.error('Failed to download summary')
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const formattedSubmissions = submissions.map(formatSubmissionData)

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">Loading video submissions...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Video Submissions</h1>
          <p className="text-muted-foreground mt-2">
            Review and manage student video submissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={handleProcessVideos} disabled={processing}>
            <Play className="h-4 w-4 mr-2" />
            {processing ? 'Processing...' : 'Process All'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedSubmissions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formattedSubmissions.filter(s => s.status === 'reviewed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formattedSubmissions.filter(s => s.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Star className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                formattedSubmissions.filter(s => s.score !== null)
                  .reduce((acc, s) => acc + (s.score || 0), 0) / 
                formattedSubmissions.filter(s => s.score !== null).length || 0
              )}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Video Submissions</CardTitle>
          <CardDescription>
            Review all student video submissions and AI rankings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by student name or video title..." className="pl-8" />
            </div>
            <Button variant="outline">Filter</Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formattedSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-10 bg-muted rounded flex items-center justify-center">
                          <Video className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{submission.title}</div>
                          <div className="text-sm text-muted-foreground">{submission.fileSize}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{submission.studentName}</div>
                        <div className="text-sm text-muted-foreground">{submission.studentId}</div>
                      </div>
                    </TableCell>
                    <TableCell>{submission.duration}</TableCell>
                    <TableCell>
                      <span className="text-sm">{submission.submittedAt}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status, submission.ranking)}</TableCell>
                    <TableCell>
                      {submission.score ? (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{submission.score}%</span>
                          {submission.ranking && submission.ranking <= 3 && (
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownloadSummary(submission)}
                          title="Download summary"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {submission.status !== 'processed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleProcessVideo(submission.id)}
                            disabled={processing}
                          >
                            Process
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* AI Processing Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            AI Processing Status
          </CardTitle>
          <CardDescription>
            CrewAI agents automatically process and rank video submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <h4 className="font-medium">Video Processing Agent</h4>
                <p className="text-sm text-muted-foreground">Analyzing video content and quality</p>
              </div>
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                <Clock className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <h4 className="font-medium">Final Ranking Agent</h4>
                <p className="text-sm text-muted-foreground">Determining final rankings and winners</p>
              </div>
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                Waiting
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

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

// Mock video submissions data
const submissions = [
  {
    id: "VID001",
    studentName: "John Doe",
    studentId: "STU001",
    title: "AI in Healthcare",
    duration: "2:45",
    fileSize: "45.2 MB",
    submittedAt: "2025-09-25 14:30",
    status: "reviewed",
    score: 85,
    ranking: 2,
    thumbnail: "/api/placeholder/200/120"
  },
  {
    id: "VID002",
    studentName: "Jane Smith", 
    studentId: "STU002",
    title: "Machine Learning Applications",
    duration: "3:12",
    fileSize: "52.8 MB",
    submittedAt: "2025-09-26 10:15",
    status: "pending",
    score: null,
    ranking: null,
    thumbnail: "/api/placeholder/200/120"
  },
  {
    id: "VID003",
    studentName: "Mike Johnson",
    studentId: "STU003", 
    title: "Future of AI Technology",
    duration: "2:58",
    fileSize: "48.7 MB",
    submittedAt: "2025-09-26 16:45",
    status: "reviewed",
    score: 92,
    ranking: 1,
    thumbnail: "/api/placeholder/200/120"
  },
  {
    id: "VID004",
    studentName: "Sarah Wilson",
    studentId: "STU004",
    title: "AI Ethics and Society", 
    duration: "3:05",
    fileSize: "51.3 MB",
    submittedAt: "2025-09-27 09:20",
    status: "processing",
    score: null,
    ranking: null,
    thumbnail: "/api/placeholder/200/120"
  }
]

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
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Process All
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
            <div className="text-2xl font-bold">{submissions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions.filter(s => s.status === 'reviewed').length}
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
              {submissions.filter(s => s.status === 'pending').length}
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
                submissions.filter(s => s.score !== null)
                  .reduce((acc, s) => acc + (s.score || 0), 0) / 
                submissions.filter(s => s.score !== null).length || 0
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
                {submissions.map((submission) => (
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
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
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

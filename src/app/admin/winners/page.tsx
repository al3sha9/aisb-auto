"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Trophy, 
  Medal, 
  Star,
  Crown,
  Play,
  Download,
  Eye,
  Mail
} from "lucide-react"

// Mock winners data
const winners = [
  {
    position: 1,
    studentName: "Mike Johnson",
    studentId: "STU003",
    email: "mike@example.com",
    videoTitle: "Future of AI Technology",
    finalScore: 92,
    aiRanking: 1,
    quizScore: 90,
    videoScore: 94,
    notified: true,
    prize: "First Place - $500 + Certificate"
  },
  {
    position: 2,
    studentName: "John Doe", 
    studentId: "STU001",
    email: "john@example.com",
    videoTitle: "AI in Healthcare",
    finalScore: 85,
    aiRanking: 2,
    quizScore: 80,
    videoScore: 90,
    notified: true,
    prize: "Second Place - $300 + Certificate"
  },
  {
    position: 3,
    studentName: "Sarah Wilson",
    studentId: "STU004",
    email: "sarah@example.com", 
    videoTitle: "AI Ethics and Society",
    finalScore: 82,
    aiRanking: 3,
    quizScore: 85,
    videoScore: 79,
    notified: false,
    prize: "Third Place - $200 + Certificate"
  }
]

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
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contest Winners</h1>
          <p className="text-muted-foreground mt-2">
            AI-selected winners from video contest submissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
          <Button>
            <Mail className="h-4 w-4 mr-2" />
            Notify All
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
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-sm text-muted-foreground">Winners Selected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">87%</div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">4</div>
              <div className="text-sm text-muted-foreground">Total Submissions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">2</div>
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
                      {winner.position === 1 && "🥇"} 
                      {winner.position === 2 && "🥈"}
                      {winner.position === 3 && "🥉"}
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
                    <div className="text-sm font-medium text-muted-foreground mb-1">Score Breakdown</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Quiz Score:</span>
                        <span className="font-medium">{winner.quizScore}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Video Score:</span>
                        <span className="font-medium">{winner.videoScore}%</span>
                      </div>
                      <div className="flex justify-between text-sm border-t pt-2">
                        <span className="font-medium">Final Score:</span>
                        <span className="font-bold">{winner.finalScore}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">AI Ranking</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{winner.aiRanking}</Badge>
                      <span className="text-sm text-muted-foreground">by AI agents</span>
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

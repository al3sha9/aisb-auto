"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  Video, 
  CheckCircle, 
  AlertTriangle,
  Play,
  Loader2,
  File,
  Clock,
  Trophy
} from "lucide-react"

export default function VideoSubmissionPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type.startsWith('video/')) {
      setFile(selectedFile)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleSubmit = async () => {
    if (!file || !title.trim()) return

    setUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      setSubmitted(true)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Video Submitted Successfully!</CardTitle>
            <CardDescription>
              Your video has been uploaded and will be processed by our AI agents for ranking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="font-medium">{title}</div>
                <div className="text-sm text-muted-foreground">
                  {file?.name} • {file && formatFileSize(file.size)}
                </div>
              </div>
              
              <Alert>
                <Trophy className="h-4 w-4" />
                <AlertTitle>What&apos;s Next?</AlertTitle>
                <AlertDescription>
                  Our AI agents will analyze your video and rank it against other submissions. 
                  You&apos;ll be notified via email when winners are announced!
                </AlertDescription>
              </Alert>
            </div>

            <Button className="w-full" onClick={() => window.location.href = '/'}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Video Submission</h1>
              <p className="text-muted-foreground">Upload your video for the AI contest</p>
            </div>
            <Badge variant="outline">Contest Entry</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Requirements */}
          <Alert>
            <Video className="h-4 w-4" />
            <AlertTitle>Video Requirements</AlertTitle>
            <AlertDescription>
              • Maximum file size: 100MB<br/>
              • Maximum duration: 5 minutes<br/>
              • Supported formats: MP4, MOV, AVI, WebM<br/>
              • Content should be relevant to AI/technology
            </AlertDescription>
          </Alert>

          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Video</CardTitle>
              <CardDescription>
                Share your creativity and knowledge about AI and technology
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Video Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="video-title">Video Title *</Label>
                  <Input 
                    id="video-title"
                    placeholder="Enter your video title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={uploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-description">Description (Optional)</Label>
                  <Textarea 
                    id="video-description"
                    placeholder="Describe your video content..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    disabled={uploading}
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <Label htmlFor="video-file">Video File *</Label>
                
                {!file ? (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <Video className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-lg font-medium">Upload Your Video</div>
                        <div className="text-sm text-muted-foreground">
                          Drag and drop your video file here, or click to browse
                        </div>
                      </div>
                      <Input
                        id="video-file"
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="w-full"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                        <Play className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </div>
                      </div>
                      {!uploading && (
                        <Button
                          variant="ghost" 
                          size="sm"
                          onClick={() => setFile(null)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    {uploading && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                onClick={handleSubmit}
                disabled={!file || !title.trim() || uploading}
                className="w-full"
                size="lg"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading Video...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Video
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Contest Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Contest Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">🥇 $500</div>
                    <div className="text-sm">First Place</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">🥈 $300</div>
                    <div className="text-sm">Second Place</div>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">🥉 $200</div>
                  <div className="text-sm">Third Place</div>
                </div>

                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertTitle>Judging Process</AlertTitle>
                  <AlertDescription>
                    Videos are evaluated by advanced AI agents that analyze content quality, 
                    relevance, creativity, and technical presentation. Winners are selected automatically 
                    and fairly based on comprehensive scoring criteria.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

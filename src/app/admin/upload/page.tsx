"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Play,
  Loader2
} from "lucide-react"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [uploadMessage, setUploadMessage] = useState('')

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type.includes('sheet')) {
      setFile(selectedFile)
      setUploadStatus('idle')
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setUploadStatus('idle')

    try {
      // Create form data for file upload
      const formData = new FormData()
      formData.append('file', file)

      // Call backend API
      const response = await fetch('/api/students/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setUploadStatus('success')
        setUploadMessage(`File "${file.name}" uploaded successfully! Added ${result.count} students.`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || `Upload failed: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('error')
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
        if (errorMessage.includes("duplicate key value violates unique constraint")) {
          errorMessage = "Some students could not be uploaded because their email addresses already exist. Please check your Excel file for duplicate emails.";
        }
      }
      setUploadMessage(`Failed to upload file: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  const handleStartGeneration = async () => {
    // TODO: Trigger quiz generation workflow
    console.log('Starting quiz generation...')
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Excel File</h1>
        <p className="text-muted-foreground mt-2">
          Upload student data to generate personalized quizzes
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Student Data Upload
          </CardTitle>
          <CardDescription>
            Upload an Excel file containing student information and data for quiz generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select Excel File</Label>
            <div className="flex items-center gap-4">
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={uploading}
                className="flex-1"
              />
              {file && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <FileSpreadsheet className="h-3 w-3" />
                  {file.name}
                </Badge>
              )}
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </>
            )}
          </Button>

          {uploadStatus === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>{uploadMessage}</AlertDescription>
            </Alert>
          )}

          {uploadStatus === 'error' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{uploadMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* File Format Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>File Format Requirements</CardTitle>
          <CardDescription>
            Your Excel file should follow this format for optimal quiz generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Required Columns:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• <strong>name:</strong> Student&nbsp;s full name</li>
                <li>• <strong>email:</strong> Student&nbsp;s email address</li>
                <li>• <strong>student_id:</strong> Unique student identifier</li>
                <li>• <strong>data:</strong> Additional data for quiz personalization</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Sample Format:</h4>
              <div className="bg-muted p-4 rounded-lg text-sm">
                <div className="grid grid-cols-4 gap-4 font-mono">
                  <div className="font-semibold">name</div>
                  <div className="font-semibold">email</div>
                  <div className="font-semibold">student_id</div>
                  <div className="font-semibold">data</div>
                  <div>John Doe</div>
                  <div>john@example.com</div>
                  <div>STU001</div>
                  <div>Additional info...</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      {uploadStatus === 'success' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Next Steps
            </CardTitle>
            <CardDescription>
              Your file has been uploaded. Now you can start the quiz generation process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleStartGeneration} className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Start Quiz Generation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
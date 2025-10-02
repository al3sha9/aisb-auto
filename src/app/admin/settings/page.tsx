"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Save, 
  RefreshCw,
  Key,
  Database,
  Mail,
  Video,
  Bot,
  Shield,
  AlertTriangle,
  CheckCircle
} from "lucide-react"

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure system settings and integrations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {saved && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Settings Saved</AlertTitle>
          <AlertDescription>Your configuration has been updated successfully.</AlertDescription>
        </Alert>
      )}

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Configuration
          </CardTitle>
          <CardDescription>
            Configure external API keys and endpoints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              <Input 
                id="openai-key"
                type="password" 
                placeholder="sk-..." 
                defaultValue="sk-*********************"
              />
              <p className="text-xs text-muted-foreground">
                Used for quiz generation and content analysis
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="google-key">Google AI API Key</Label>
              <Input 
                id="google-key"
                type="password" 
                placeholder="AIza..." 
                defaultValue=""
              />
              <p className="text-xs text-muted-foreground">
                Alternative AI provider for quiz generation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Settings
          </CardTitle>
          <CardDescription>
            Database connection and backup configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="db-url">Database URL</Label>
              <Input 
                id="db-url"
                defaultValue="postgresql://localhost:5432/aisb" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Backup Frequency</Label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Every Hour</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <div className="font-medium">Database Status</div>
              <div className="text-sm text-muted-foreground">Connection established</div>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Settings
          </CardTitle>
          <CardDescription>
            Configure email notifications and SMTP settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input 
                id="smtp-host"
                defaultValue="smtp.gmail.com" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input 
                id="smtp-port"
                type="number"
                defaultValue="587" 
              />
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email-user">Email Username</Label>
              <Input 
                id="email-user"
                type="email"
                defaultValue="admin@aisb.com" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email-pass">Email Password</Label>
              <Input 
                id="email-pass"
                type="password"
                defaultValue="****************" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-template">Default Email Template</Label>
            <Textarea 
              id="email-template"
              rows={4}
              defaultValue="Dear {student_name},&#10;&#10;You have been invited to participate in the AISB quiz contest...&#10;&#10;Best regards,&#10;AISB Team"
            />
          </div>
        </CardContent>
      </Card>

      {/* Video Processing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Processing
          </CardTitle>
          <CardDescription>
            Configure video upload and processing settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="max-file-size">Max File Size (MB)</Label>
              <Input 
                id="max-file-size"
                type="number"
                defaultValue="100" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-duration">Max Duration (minutes)</Label>
              <Input 
                id="max-duration"
                type="number"
                defaultValue="5" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-quality">Processing Quality</Label>
              <Select defaultValue="high">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Fast)</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High (Slow)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allowed-formats">Allowed Video Formats</Label>
            <Input 
              id="allowed-formats"
              defaultValue="mp4, mov, avi, webm" 
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of allowed video file extensions
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CrewAI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            CrewAI Settings
          </CardTitle>
          <CardDescription>
            Configure AI agents and workflow settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="agent-model">Default AI Model</Label>
              <Select defaultValue="gpt-4">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                  <SelectItem value="mock">Mock (Development)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quiz-questions">Questions per Quiz</Label>
              <Input 
                id="quiz-questions"
                type="number"
                defaultValue="15" 
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="agent-timeout">Agent Timeout (seconds)</Label>
              <Input 
                id="agent-timeout"
                type="number"
                defaultValue="300" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-retries">Max Retries</Label>
              <Input 
                id="max-retries"
                type="number"
                defaultValue="3" 
              />
            </div>
          </div>

          <Alert>
            <Bot className="h-4 w-4" />
            <AlertTitle>Agent Status</AlertTitle>
            <AlertDescription>
              All CrewAI agents are currently active and ready for workflow execution.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Privacy
          </CardTitle>
          <CardDescription>
            Configure security settings and data privacy options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
              <Input 
                id="session-timeout"
                type="number"
                defaultValue="24" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data-retention">Data Retention (days)</Label>
              <Input 
                id="data-retention"
                type="number"
                defaultValue="365" 
              />
            </div>
          </div>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Security Notice</AlertTitle>
            <AlertDescription>
              Make sure to regularly update API keys and review access logs. 
              Student data is encrypted and stored securely according to privacy regulations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

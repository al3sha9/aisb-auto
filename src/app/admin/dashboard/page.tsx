"use client"
import { supabase } from "@/lib/supabase-client";

import toast from "react-hot-toast";
import Link from "next/link";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Users, Brain, Mail, FileText, BarChart3, Clock, CheckCircle, XCircle, LogOut, Shield, Trash2 } from 'lucide-react'
// import { EmailSuccessModal } from '@/components/EmailSuccessModal'

interface Student {
  id: number
  name: string
  email: string
  created_at: string
}

interface Quiz {
  id: number
  title: string
  description: string
  questions: Question[]
  created_at: string
}

interface Question {
  id: number
  question: string
  options: string[]
  correct_answer: string
}

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
  completed_at: string
  time_taken_minutes: number | null
}

interface AdminUser {
  id: number
  email: string
}

export default function AdminDashboard() {
  const router = useRouter()

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])



  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    router.push('/admin/login')
  }

  const [sending, setSending] = useState(false)






  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    const userData = localStorage.getItem('admin_user')

    if (!token || !userData) {
      router.push('/admin/login')
      return
    }

    try {
      setAdminUser(JSON.parse(userData))
    } catch {
      router.push('/admin/login')
      return
    }

    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const { data: students, error: studentsError } = await supabase
        .from("students")
        .select("*");

      if (studentsError) throw studentsError;
      setStudents(students);

      const { data: quizzes, error: quizzesError } = await supabase
        .from("quizzes")
        .select("*, questions(*)");

      if (quizzesError) throw quizzesError;
      setQuizzes(quizzes);

    } catch (err: any) {
      toast.error(`Failed to fetch data: ${err.message}`);
    }
  };







  const handleSendQuizEmails = async (quizId: number) => {
    setSending(true);
    const toastId = toast.loading("Sending invitations...");

    try {
      const response = await fetch("/api/quizzes/send-invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quizId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send invitations");
      }

      toast.success("Invitations sent successfully!", { id: toastId });
    } catch (error) {
      toast.error(`Failed to send invitations: ${error.message}`, { id: toastId });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteQuiz = async (quizId: number, quizTitle: string) => {
    if (!confirm(`Are you sure you want to delete the quiz "${quizTitle}"? This will also delete all questions, results, and related data. This action cannot be undone.`)) {
      return
    }

    const toastId = toast.loading("Deleting quiz...");

    try {
      const { error } = await supabase.from("quizzes").delete().eq("id", quizId);

      if (error) {
        throw error;
      }

      toast.success(`Quiz "${quizTitle}" deleted successfully`, { id: toastId });
      setQuizzes(quizzes.filter(q => q.id !== quizId));
    } catch (err) {
      toast.error(`Failed to delete quiz: ${err.message}`, { id: toastId });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage students, generate AI-powered quizzes, and track results
          </p>
        </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>{adminUser?.email}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>      </div>



      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Quizzes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizzes.length}</div>
          </CardContent>
        </Card>



              </div>

      {/* Main Tabs */}
      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <Link href="/admin/results"><TabsTrigger value="results">Results</TabsTrigger></Link>
          <Link href="/admin/video-submissions"><TabsTrigger value="video-submissions">Video Submissions</TabsTrigger></Link>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Manage Students
              </CardTitle>
              <CardDescription>
                View existing students or upload a new list.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button asChild>
                <Link href="/admin/students">View Students</Link>
              </Button>
              <Button asChild>
                <Link href="/admin/upload">Upload Students</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quizzes Tab */}
        <TabsContent value="quizzes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                New Quiz
              </CardTitle>
              <CardDescription>
                Create a new quiz manually.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/quizzes/new">Create Manually</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quiz List ({quizzes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{quiz.title}</h3>
                        <p className="text-sm text-muted-foreground">{quiz.description}</p>
                      </div>
                      <Badge>{quiz.questions?.length || 0} questions</Badge>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(quiz.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <Button asChild size="sm">
                          <Link href={`/admin/quizzes/${quiz.id}`}>View</Link>
                        </Button>
                        <Button
                          onClick={() => handleSendQuizEmails(quiz.id)}
                          disabled={sending || students.length === 0}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Mail className="h-4 w-4" />
                          {sending ? 'Sending...' : 'Send to Students'}
                        </Button>
                        <Button
                          onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* Preview Questions */}
                    {quiz.questions && quiz.questions.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-medium text-sm">Preview Questions:</h4>
                        {quiz.questions.slice(0, 3).map((q, idx) => (
                          <div key={q.id} className="text-sm text-muted-foreground pl-4">
                            {idx + 1}. {q.question.substring(0, 80)}...
                          </div>
                        ))}
                        {quiz.questions.length > 3 && (
                          <div className="text-sm text-muted-foreground pl-4">
                            ...and {quiz.questions.length - 3} more questions
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {quizzes.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No quizzes generated yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>

      {/* Email Success Modal */}
      {/* <EmailSuccessModal
        isOpen={emailModal.isOpen}
        onClose={() => setEmailModal({ ...emailModal, isOpen: false })}
        sentCount={emailModal.sentCount}
        recipientEmails={emailModal.recipientEmails}
      /> */}
    </div>
  )
}
import { apiClient } from './api-client'

// Types
export interface Student {
  id: number
  name: string
  email: string
  extra_info?: string
  created_at: string
}

export interface Quiz {
  id: number
  title: string
  description?: string
  time_limit_minutes: number
  is_active: boolean
  created_at: string
}

export interface Question {
  id: number
  quiz_id: number
  question_text: string
  question_type: 'MCQ' | 'TRUE_FALSE' | 'FILL_BLANK'
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  options?: string[]
  correct_answer: string
  points: number
}

export interface VideoSubmission {
  id: number
  student_id: number
  title: string
  description?: string
  file_path: string
  file_size?: number
  duration_seconds?: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  ai_score?: number
  ranking?: number
  submitted_at: string
  processed_at?: string
}

export interface Answer {
  id: number
  student_id: number
  question_id: number
  answer_text: string
  is_correct?: boolean
  points_earned: number
  answered_at: string
}

export interface AgentLog {
  id: number
  agent_name: string
  task_description: string
  status: 'RUNNING' | 'COMPLETED' | 'FAILED'
  result?: string
  error_message?: string
  execution_time_seconds?: number
  started_at: string
  completed_at?: string
}

// Admin API
export const adminApi = {
  // Authentication
  login: (email: string, password: string) =>
    apiClient.post<{ access_token: string; admin: any }>('/api/admin/login', { email, password }),
  
  register: (name: string, email: string, password: string) =>
    apiClient.post<{ message: string }>('/api/admin/register', { name, email, password }),
  
  // Dashboard stats
  getStats: () =>
    apiClient.get<{
      total_students: number
      active_quizzes: number
      video_submissions: number
      winners_selected: number
    }>('/api/admin/stats'),
}

// Student API
export const studentApi = {
  // Get all students
  getAll: () =>
    apiClient.get<Student[]>('/api/student/'),
  
  // Get student by ID
  getById: (id: number) =>
    apiClient.get<Student>(`/api/student/${id}`),
  
  // Create student
  create: (student: { name: string; email: string; extra_info?: string }) =>
    apiClient.post<Student>('/api/student/', student),
  
  // Upload Excel file with student data
  uploadExcel: (file: File) =>
    apiClient.uploadFile<{ message: string; students_created: number }>('/api/student/upload-excel', file),
}

// Quiz API
export const quizApi = {
  // Get all quizzes
  getAll: () =>
    apiClient.get<Quiz[]>('/api/quiz/'),
  
  // Get quiz by ID
  getById: (id: number) =>
    apiClient.get<Quiz>(`/api/quiz/${id}`),
  
  // Get quiz questions
  getQuestions: (quizId: number) =>
    apiClient.get<Question[]>(`/api/quiz/${quizId}/questions`),
  
  // Create quiz (usually done by AI agent)
  create: (quiz: { title: string; description?: string; time_limit_minutes?: number }) =>
    apiClient.post<Quiz>('/api/quiz/', quiz),
  
  // Activate/deactivate quiz
  toggleActive: (id: number, is_active: boolean) =>
    apiClient.put<Quiz>(`/api/quiz/${id}/toggle-active`, { is_active }),
  
  // Submit quiz answers
  submitAnswers: (quizId: number, answers: { question_id: number; answer_text: string }[]) =>
    apiClient.post<{ message: string; score: number }>(`/api/quiz/${quizId}/submit`, { answers }),
}

// Video API
export const videoApi = {
  // Get all video submissions
  getAll: () =>
    apiClient.get<VideoSubmission[]>('/api/video/'),
  
  // Get video by ID
  getById: (id: number) =>
    apiClient.get<VideoSubmission>(`/api/video/${id}`),
  
  // Submit video
  submit: (file: File, title: string, description?: string, studentId?: number) =>
    apiClient.uploadFile<VideoSubmission>('/api/video/submit', file, {
      title,
      description,
      student_id: studentId,
    }),
  
  // Get winners
  getWinners: () =>
    apiClient.get<VideoSubmission[]>('/api/video/winners'),
}

// Agent API
export const agentApi = {
  // Get agent logs
  getLogs: () =>
    apiClient.get<AgentLog[]>('/api/agents/logs'),
  
  // Start quiz generation workflow
  startQuizGeneration: (excelData?: any) =>
    apiClient.post<{ message: string; task_id: string }>('/api/agents/start-quiz-generation', excelData),
  
  // Start video processing workflow
  startVideoProcessing: () =>
    apiClient.post<{ message: string; task_id: string }>('/api/agents/start-video-processing'),
  
  // Get workflow status
  getWorkflowStatus: (taskId: string) =>
    apiClient.get<{ status: string; result?: any }>(`/api/agents/status/${taskId}`),
}

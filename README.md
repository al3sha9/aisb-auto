# AI Skill Bridge (AISB) - Intelligent Quiz & Video Assessment Platform

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-2.58.0-green)
![CrewAI](https://img.shields.io/badge/CrewAI-Powered-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC)

## 🚀 Overview

AI Skill Bridge (AISB) is an advanced educational platform that combines intelligent quiz generation with AI-powered video assessment. The platform leverages CrewAI agents to automate the entire assessment workflow, from generating personalized quizzes to evaluating video submissions and ranking participants.

## 🏗️ Architecture

The platform is built using modern web technologies and AI frameworks:

- **Frontend**: Next.js 15.5.4 with TypeScript and Tailwind CSS
- **Database**: Supabase with PostgreSQL
- **AI Framework**: CrewAI for intelligent agent orchestration
- **LLM Integration**: Groq for fast AI inference
- **Email Service**: Resend for automated notifications
- **UI Components**: Radix UI primitives with custom styling

## 🤖 AI Agents & Tools

### Core Agents

The platform utilizes CrewAI-powered agents that work together to create a seamless assessment experience:

#### 1. Quiz Generator Agent
- **Purpose**: Creates personalized quizzes based on topics, difficulty, and requirements
- **Capabilities**:
  - Dynamic question generation from uploaded Excel data
  - Multiple difficulty levels (Easy, Medium, Hard)
  - Customizable topic coverage
  - Time-based question allocation
- **Tool**: `quizGeneratorTool`

#### 2. Video Processor Agent
- **Purpose**: Analyzes video submissions using transcript-based evaluation
- **Capabilities**:
  - YouTube video transcript extraction
  - Content relevance scoring (0-40 points)
  - Content quality assessment (0-30 points)
  - Presentation evaluation (0-20 points)
  - Engagement scoring (0-10 points)
- **Tool**: `videoProcessorTool`

#### 3. Score & Notify Agent
- **Purpose**: Calculates quiz scores and notifies top performers
- **Capabilities**:
  - Automated scoring of quiz submissions
  - Top 5 performer identification
  - Personalized email notifications
- **Tool**: `scoreAndNotifyTool`

#### 4. Final Ranking Agent
- **Purpose**: Combines quiz and video scores for final rankings
- **Capabilities**:
  - Comprehensive score calculation
  - Top 5% winner selection (minimum 1, maximum 10)
  - Prize tier assignment
  - Winner notification system
- **Tool**: `finalRankingTool`

#### 5. Email Communication Agent
- **Purpose**: Handles all automated email communications
- **Capabilities**:
  - Quiz invitations
  - Score notifications
  - Winner announcements
  - Custom template support
- **Tool**: `emailTool`

### Tool Ecosystem

Each agent utilizes specialized tools built with LangChain core:

```typescript
// Example Tool Structure
export const exampleTool = tool(
  async (input) => {
    // Tool logic implementation
    return 'Tool execution result';
  },
  {
    name: 'ExampleTool',
    description: 'Tool description for AI agent understanding',
    schema: z.object({
      // Input validation schema
    }),
  }
);
```

## 📊 Platform Flow

### 1. Student Onboarding
```
Excel Upload → Student Data Import → Database Storage → Email Invitations
```

### 2. Quiz Assessment Phase
```
Quiz Generation → Student Participation → Automated Scoring → Top 5 Selection
```

### 3. Video Submission Phase
```
Video Upload → Transcript Extraction → AI Analysis → Content Scoring
```

### 4. Final Evaluation
```
Score Combination → Final Ranking → Winner Selection → Prize Distribution
```

### 5. Notification System
```
Automated Emails → Score Reports → Winner Announcements
```

## 🎯 Key Features

### Admin Dashboard
- **Student Management**: Import, view, and manage student data
- **Quiz Creation**: Generate quizzes with AI assistance
- **Video Review**: Monitor and process video submissions
- **Results Analytics**: Comprehensive scoring and ranking views
- **Winner Management**: Track and notify competition winners
- **Settings Configuration**: Customize platform parameters

### Student Interface
- **Quiz Participation**: Time-based quiz taking with instant feedback
- **Video Submission**: YouTube link submission with metadata
- **Progress Tracking**: Real-time status updates

### Intelligent Assessment
- **Multi-Modal Evaluation**: Combines written and video assessments
- **AI-Powered Scoring**: Consistent and fair evaluation criteria
- **Automated Workflows**: Minimal manual intervention required

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Groq API key
- Resend API key

### Environment Variables
Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Configuration
GROQ_API_KEY=your_groq_api_key

# Email Configuration
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=your_sender_email

# App Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up database**
```bash
# Run the schema.sql file in your Supabase dashboard
# or use the Supabase CLI
supabase db reset
```

4. **Start development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
npm start
```

## 🗄️ Database Schema

### Core Tables

#### Students
```sql
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Quizzes
```sql
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    num_questions INT NOT NULL,
    difficulty VARCHAR(50),
    topics TEXT[],
    time_per_question INT,
    type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Video Submissions
```sql
CREATE TABLE video_submissions (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id),
    youtube_link VARCHAR(255) NOT NULL,
    transcript TEXT,
    evaluation JSONB,
    score INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 API Endpoints

### Quiz Management
- `POST /api/quizzes/generate` - Generate new quiz with AI
- `POST /api/quizzes/activate` - Activate/deactivate quizzes
- `POST /api/quizzes/score-and-notify` - Score quizzes and notify winners
- `POST /api/quizzes/send-invitations` - Send quiz invitations

### Video Processing
- `POST /api/videos/process` - Process video submissions
- `PUT /api/videos/process` - Process single video
- `POST /api/videos/final-rank-and-notify` - Final ranking and notifications

### Student Management
- `POST /api/students/upload` - Bulk student upload from Excel
- `GET /api/students` - Retrieve student data

### Authentication
- `POST /api/admin/login` - Admin authentication

## 🎨 UI Components

Built with Radix UI and styled with Tailwind CSS:

- **Forms**: React Hook Form with Zod validation
- **Tables**: Sortable data tables with pagination
- **Modals**: Accessible dialog components
- **Navigation**: Responsive sidebar navigation
- **Notifications**: Toast notifications with react-hot-toast
- **Loading States**: Skeleton loaders and progress indicators

## 📈 Assessment Criteria

### Quiz Scoring
- **Automatic Calculation**: Based on correct answers
- **Time Consideration**: Bonus points for faster completion
- **Top 5 Selection**: Highest scoring participants advance

### Video Evaluation Metrics
1. **Relevance Score (40%)**: Content alignment with quiz topics
2. **Content Quality (30%)**: Educational value and depth
3. **Presentation (20%)**: Communication clarity and style
4. **Engagement (10%)**: Content appeal and informativeness

### Final Ranking Algorithm
```
Final Score = Quiz Score (60%) + Video Score (40%)
Winners = Top 5% of participants (min: 1, max: 10)
```

## 🏆 Competition Management

### Prize Structure
- **1st Place**: Winner Certificate + Recognition
- **2nd Place**: Runner-up Certificate
- **3rd Place**: Third Place Certificate
- **Participation**: Certificate of Participation

### Automated Workflows
1. **Student Import**: Excel file processing and email generation
2. **Quiz Distribution**: Automated invitation sending
3. **Score Processing**: Real-time calculation and ranking
4. **Winner Selection**: Algorithm-based top performer identification
5. **Notification System**: Automated congratulatory emails

## 🔒 Security Features

- **Data Validation**: Zod schema validation on all inputs
- **SQL Injection Protection**: Parameterized queries via Supabase
- **Type Safety**: Full TypeScript implementation
- **Environment Security**: Secure environment variable handling
- **Rate Limiting**: API endpoint protection

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic builds on push

### Environment Configuration
Ensure all environment variables are properly set in your deployment platform.

## 🔄 Development Workflow

### Code Quality
- **ESLint**: Comprehensive linting rules
- **TypeScript**: Strict type checking
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality assurance

### Testing Strategy
- **Component Testing**: React Testing Library
- **API Testing**: Jest for endpoint validation
- **E2E Testing**: Playwright for user journey testing

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with proper TypeScript types
4. Add comprehensive tests
5. Submit a pull request with description

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Future Enhancements

- **Real-time Collaboration**: Live quiz participation
- **Advanced Analytics**: Detailed performance insights
- **Multi-language Support**: Internationalization
- **Mobile App**: React Native implementation
- **Advanced AI Models**: Enhanced evaluation capabilities

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using CrewAI, Next.js, and modern web technologies**
# aisb-auto

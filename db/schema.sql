
-- Students table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quizzes table
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

-- Questions table
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    quiz_id INT REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Answers table
CREATE TABLE answers (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    question_id INT REFERENCES questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Video submissions table
CREATE TABLE video_submissions (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    quiz_id INT REFERENCES quizzes(id) ON DELETE CASCADE,
    video_url VARCHAR(255) NOT NULL,
    analysis_data JSONB,
    score INT,
    status VARCHAR(50) DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

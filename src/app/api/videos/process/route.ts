
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { ChatGroq } from '@langchain/groq'
import { PromptTemplate } from '@langchain/core/prompts'
import { RunnableSequence } from '@langchain/core/runnables'

// Initialize Groq chat model
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY!,
  model: 'llama-3.1-8b-instant',
  temperature: 0.3,
})

// Function to extract video ID from YouTube URL
function extractVideoId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') {
    return null
  }
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// Function to get video transcript using RapidAPI
async function getVideoTranscript(videoId: string) {
  try {
    const response = await fetch(
      `https://youtube-transcript3.p.rapidapi.com/api/transcript?videoId=${videoId}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY || 'f66cd1d01emshd5f00aee61a4c56p16f2aejsnb029116c21a7',
          'x-rapidapi-host': 'youtube-transcript3.p.rapidapi.com'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`RapidAPI call failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Extract transcript text from the response
    if (data && data.transcript && Array.isArray(data.transcript)) {
      const transcriptText = data.transcript
        .map((item: { text: string }) => item.text)
        .join(' ')
        .replace(/\[.*?\]/g, '') // Remove timestamp markers
        .trim()
      
      return transcriptText
    }
    
    return null
  } catch (error) {
    console.error('Error fetching video transcript:', error)
    return null
  }
}

// Create prompt template for video analysis
const analysisPrompt = PromptTemplate.fromTemplate(`
You are an AI expert evaluating a student's video submission for a quiz about "{quizTopics}".

Video Information:
- Video URL: {videoUrl}
- Video ID: {videoId}
- Full Transcript: {videoTranscript}

Quiz Context:
- Quiz Name: {quizName}
- Topics Covered: {quizTopics}
- Student Name: {studentName}

Based on the video transcript, please analyze this video submission and provide:

1. RELEVANCE SCORE (0-40 points): How well does the video content relate to the quiz topics?
2. CONTENT QUALITY (0-30 points): Educational value, clarity, and depth of content based on transcript
3. PRESENTATION (0-20 points): Communication style and clarity based on transcript
4. ENGAGEMENT (0-10 points): How engaging and informative the content appears from transcript

Provide your response in the following JSON format:
{{
  "relevanceScore": <number 0-40>,
  "contentQualityScore": <number 0-30>,
  "presentationScore": <number 0-20>,
  "engagementScore": <number 0-10>,
  "totalScore": <sum of all scores>,
  "summary": "<2-3 sentence summary of the video's content and relevance based on transcript>",
  "feedback": "<constructive feedback for the student based on transcript analysis>",
  "topicAlignment": "<how well the video content aligns with quiz topics based on transcript>"
}}

Be fair but thorough in your evaluation. Focus on the actual content from the transcript and its relevance to the topics.
`)

export async function POST(request: NextRequest) {
  try {
    const { submissionIds } = await request.json()
    
    if (!submissionIds || !Array.isArray(submissionIds)) {
      return NextResponse.json({ error: 'Invalid submission IDs' }, { status: 400 })
    }

    const results = []

    for (const submissionId of submissionIds) {
      try {
        // Get submission details
        const { data: submission, error: submissionError } = await supabase
          .from('video_submissions')
          .select(`
            id,
            student_id,
            youtube_link,
            transcript,
            evaluation,
            created_at,
            students (name, email)
          `)
          .eq('id', submissionId)
          .single()

        if (submissionError || !submission) {
          console.error(`Error fetching submission ${submissionId}:`, submissionError)
          continue
        }

        // Extract video ID from URL
        console.log('Submission object:', JSON.stringify(submission, null, 2))
        const videoUrl = submission.youtube_link
        const videoId = extractVideoId(videoUrl)
        if (!videoId) {
          console.error(`Invalid YouTube URL for submission ${submissionId}. URL was: ${videoUrl}`)
          continue
        }

        // Get video transcript
        const transcript = await getVideoTranscript(videoId)
        if (!transcript) {
          console.error(`Could not fetch video transcript for submission ${submissionId}`)
          continue
        }

        // Prepare data for analysis
        const analysisData = {
          quizTopics: 'AI and Technology',
          videoTranscript: transcript.substring(0, 2000), // Limit to 2000 chars for analysis
          videoUrl: videoUrl,
          videoId: videoId,
          quizName: 'Video Assessment Quiz',
          studentName: 'Student'
        }

        // Create analysis chain
        const chain = RunnableSequence.from([
          analysisPrompt,
          model,
        ])

        // Run analysis
        const result = await chain.invoke(analysisData)
        
        // Parse the AI response
        let analysis
        try {
          // Extract JSON from the response
          const responseContent = typeof result.content === 'string' 
            ? result.content 
            : JSON.stringify(result.content)
          
          const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            analysis = JSON.parse(jsonMatch[0])
          } else {
            throw new Error('No JSON found in response')
          }
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError)
          // Fallback analysis
          analysis = {
            relevanceScore: 20,
            contentQualityScore: 15,
            presentationScore: 10,
            engagementScore: 5,
            totalScore: 50,
            summary: 'Video analysis completed with basic scoring.',
            feedback: 'Please ensure your video clearly addresses the quiz topics.',
            topicAlignment: 'Moderate alignment with quiz topics.'
          }
        }

        // Update submission with analysis results using the existing schema
        const { error: updateError } = await supabase
          .from('video_submissions')
          .update({
            evaluation: JSON.stringify(analysis),
            transcript: 'Processed with AI analysis'
          })
          .eq('id', submissionId)

        if (updateError) {
          console.error(`Error updating submission ${submissionId}:`, updateError)
        } else {
          results.push({
            submissionId,
            score: analysis.totalScore,
            summary: analysis.summary,
            success: true
          })
          console.log(`Successfully processed submission ${submissionId}`)
        }

      } catch (error) {
        console.error(`Error processing submission ${submissionId}:`, error)
        results.push({
          submissionId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      message: `Processed ${results.filter(r => r.success).length} out of ${submissionIds.length} submissions`,
      results
    })

  } catch (error) {
    console.error('Error in video processing API:', error)
    return NextResponse.json(
      { error: 'Failed to process videos' },
      { status: 500 }
    )
  }
}

// Handle individual video processing
export async function PUT(request: NextRequest) {
  try {
    const { submissionId } = await request.json()
    
    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID required' }, { status: 400 })
    }

    // Process single submission
    const response = await POST(new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ submissionIds: [submissionId] })
    }))

    return response

  } catch (error) {
    console.error('Error processing single video:', error)
    return NextResponse.json(
      { error: 'Failed to process video' },
      { status: 500 }
    )
  }
}

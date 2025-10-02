
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export default function SubmitVideoPage() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student');
  
  const [youtubeLink, setYoutubeLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<{name: string; email: string} | null>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      if (studentId) {
        try {
          const { data, error } = await supabase
            .from("students")
            .select("name, email")
            .eq("id", studentId)
            .single();

          if (error) {
            console.warn('Student not found:', error.message);
          } else {
            setStudent(data);
          }
        } catch (error) {
          console.error('Error fetching student:', error);
        }
      }
    };

    fetchStudent();
  }, [studentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentId) {
      toast.error("Student ID not found. Please use the link from your email.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Submitting video...");

    try {
      const { error } = await supabase.from("video_submissions").insert([
        {
          student_id: parseInt(studentId),
          youtube_link: youtubeLink,
        },
      ]);

      if (error) {
        throw error;
      }

      toast.success("Video submitted successfully!", { id: toastId });
      setYoutubeLink("");
    } catch (error) {
      toast.error(`Failed to submit video: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      {student && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            🎉 Congratulations, {student.name}!
          </h2>
          <p className="text-green-700">
            You&apos;ve been selected to move to the next phase! Please submit your video below.
          </p>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-6">Submit Your Video</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        <div>
          <label htmlFor="youtubeLink" className="block text-sm font-medium text-gray-700">
            YouTube Video Link
          </label>
          <Input
            id="youtubeLink"
            value={youtubeLink}
            onChange={(e) => setYoutubeLink(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Video"}
        </Button>
      </form>
    </div>
  );
}

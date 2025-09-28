
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function VideoSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data, error } = await supabase
          .from("video_submissions")
          .select("*, students(name, email)");

        if (error) {
          throw error;
        }

        setSubmissions(data);
      } catch (error) {
        toast.error(`Failed to fetch video submissions: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const handleFinalRankAndNotify = async () => {
    setRanking(true);
    const toastId = toast.loading("Ranking and notifying...");

    try {
      const response = await fetch("/api/videos/final-rank-and-notify", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to rank and notify");
      }

      toast.success("Final ranking and notification complete!", { id: toastId });
    } catch (error) {
      toast.error(`Failed to rank and notify: ${error.message}`, { id: toastId });
    } finally {
      setRanking(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Video Submissions</h1>
        <Button onClick={handleFinalRankAndNotify} disabled={ranking}>
          {ranking ? "Ranking..." : "Rank and Notify Top 2"}
        </Button>
      </div>
      <div className="space-y-4">
        {submissions.map((submission) => (
          <div key={submission.id} className="border p-4 rounded-lg">
            <h2 className="text-xl font-bold">{submission.students.name} ({submission.students.email})</h2>
            <a href={submission.youtube_link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
              {submission.youtube_link}
            </a>
            <p className="mt-2"><span className="font-bold">Transcript:</span> {submission.transcript}</p>
            <p><span className="font-bold">Evaluation:</span> {submission.evaluation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

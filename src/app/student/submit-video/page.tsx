
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export default function SubmitVideoPage() {
  const [youtubeLink, setYoutubeLink] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Submitting video...");

    try {
      const { error } = await supabase.from("video_submissions").insert([
        {
          student_id: 1, // TODO: Get the real student ID
          youtube_link: youtubeLink,
        },
      ]);

      if (error) {
        throw error;
      }

      toast.success("Video submitted successfully!", { id: toastId });
      setYoutubeLink("");
    } catch (error) {
      toast.error(`Failed to submit video: ${error.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
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

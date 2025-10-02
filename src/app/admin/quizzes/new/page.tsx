
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase-client";
import toast from "react-hot-toast";

export default function NewQuizPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState("medium");
  const [topics, setTopics] = useState("");
  const [timePerQuestion, setTimePerQuestion] = useState(60);
  const [type, setType] = useState("multiple-choice");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Creating quiz...");

    try {
      const { data, error } = await supabase
        .from("quizzes")
        .insert([
          {
            name,
            num_questions: numQuestions,
            difficulty,
            topics: topics.split(",").map((t) => t.trim()),
            time_per_question: timePerQuestion,
            type,
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error("Quiz creation failed: No data returned.");
      }

      toast.success("Quiz created successfully! Now generating questions...", { id: toastId });

      const quizId = data[0].id;

      const generateResponse = await fetch("/api/quizzes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId,
          numQuestions,
          difficulty,
          topics: topics.split(",").map((t) => t.trim()),
          timePerQuestion,
          type,
        }),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || "Failed to generate questions");
      }

      toast.success("Questions generated successfully!", { id: toastId });
      router.push(`/admin/quizzes/${quizId}`);
    } catch (error) { 
      toast.error(`Failed to create quiz: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Create a New Quiz</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        <div>
          <Label htmlFor="name">Quiz Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="numQuestions">Number of Questions</Label>
          <Input
            id="numQuestions"
            type="number"
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="difficulty">Difficulty</Label>
          <Input
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="topics">Topics (comma-separated)</Label>
          <Textarea
            id="topics"
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="timePerQuestion">Time Per Question (seconds)</Label>
          <Input
            id="timePerQuestion"
            type="number"
            value={timePerQuestion}
            onChange={(e) => setTimePerQuestion(parseInt(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Quiz Type</Label>
          <Input
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Quiz"}
        </Button>
      </form>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

interface Student {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("students").select("*");
    if (error) {
      toast.error(`Failed to fetch students: ${error.message}`);
    } else {
      setStudents(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDeleteStudent = async (studentId: number, studentName: string) => {
    if (!confirm(`Are you sure you want to delete student "${studentName}"? This action cannot be undone.`)) {
      return;
    }

    const toastId = toast.loading("Deleting student...");

    try {
      const { error } = await supabase.from("students").delete().eq("id", studentId);

      if (error) {
        throw error;
      }

      toast.success(`Student "${studentName}" deleted successfully`, { id: toastId });
      fetchStudents(); // Refresh the student list
    } catch (err: any) {
      toast.error(`Failed to delete student: ${err.message}`, { id: toastId });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Student List</h1>

      {students.length === 0 ? (
        <p>No students uploaded yet. Please go to the <Link href="/admin/upload" className="text-blue-500 hover:underline">upload page</Link> to add students.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Added On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{new Date(student.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteStudent(student.id, student.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

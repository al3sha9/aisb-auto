
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase-client";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet);

    const studentsToInsert = json.map((row: any) => ({
      name: row.name, // Assuming 'name' is the column header in Excel
      email: row.email, // Assuming 'email' is the column header in Excel
    }));

    // Validate data before inserting
    for (const student of studentsToInsert) {
      if (!student.name || student.name.trim() === "") {
        return NextResponse.json(
          { error: "Student name cannot be empty. Please check your Excel file." },
          { status: 400 }
        );
      }
      if (!student.email || student.email.trim() === "") {
        return NextResponse.json(
          { error: "Student email cannot be empty. Please check your Excel file." },
          { status: 400 }
        );
      }
    }

    const { error } = await supabase.from("students").insert(studentsToInsert);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: "Students uploaded successfully", count: studentsToInsert.length }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

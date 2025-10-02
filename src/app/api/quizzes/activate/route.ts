
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { quizId, isActive } = body;

    const { data, error } = await supabase
      .from("quizzes")
      .update({ is_active: isActive })
      .eq("id", quizId)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, is_active: data[0].is_active }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

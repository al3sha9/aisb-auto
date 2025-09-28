
import { NextRequest, NextResponse } from "next/server";
import { videoProcessorTool } from "@/tools/video-processor-tool";
import { supabase } from "@/lib/supabase-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { record: videoSubmission } = body;

    const result = await videoProcessorTool.invoke({ youtubeLink: videoSubmission.youtube_link });

    const { error } = await supabase
      .from("video_submissions")
      .update({ transcript: "TODO", evaluation: result })
      .eq("id", videoSubmission.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

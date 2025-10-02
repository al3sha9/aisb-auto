
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Check against admin credentials
    const adminEmail = "ali@typs.dev";
    const adminPassword = process.env.ADMIN_PASSWORD || "123";
    
    if (email === adminEmail && password === adminPassword) {
      return NextResponse.json({ access_token: "dummy-admin-token" }, { status: 200 });
    } else {
      return NextResponse.json({ detail: "Invalid credentials" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred' }, { status: 500 });
  }
}

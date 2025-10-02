
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // In a real application, you would verify the email and password against a database.
    // For now, we'll just return a dummy token.
    if (email === "admin@example.com" && password === "password") {
      return NextResponse.json({ access_token: "dummy-admin-token" }, { status: 200 });
    } else {
      return NextResponse.json({ detail: "Invalid credentials" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred' }, { status: 500 });
  }
}

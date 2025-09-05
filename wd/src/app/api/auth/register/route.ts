import { NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    const result = await registerUser({
      email,
      password,
      name,
      phone
    })

    // Create response with token in cookie
    const response = NextResponse.json({
      user: result.user,
      message: "Registration successful"
    })

    // Set HTTP-only cookie with token
    response.cookies.set("auth-token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/"
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)
    const errorMessage = error instanceof Error ? error.message : "Registration failed"
    return NextResponse.json({ error: errorMessage }, { status: 400 })
  }
}
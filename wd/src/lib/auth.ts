import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { db } from "@/lib/db"
import { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export interface User {
  id: string
  email: string
  name?: string
  phone?: string
  role: string
  isActive: boolean
  createdAt: Date
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export async function authenticateUser(email: string, password: string) {
  try {
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user || !user.password) {
      throw new Error("Invalid credentials")
    }

    const isValidPassword = verifyPassword(password, user.password)
    if (!isValidPassword) {
      throw new Error("Invalid credentials")
    }

    if (!user.isActive) {
      throw new Error("Account is deactivated")
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    }
  } catch (error) {
    throw error
  }
}

export async function registerUser(userData: {
  email: string
  password: string
  name?: string
  phone?: string
}) {
  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: userData.email }
    })

    if (existingUser) {
      throw new Error("User already exists with this email")
    }

    // Hash password
    const hashedPassword = hashPassword(userData.password)

    // Create user
    const user = await db.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        phone: userData.phone,
        role: "USER"
      }
    })

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    }
  } catch (error) {
    throw error
  }
}
export async function getAuth(request: NextRequest): Promise<User | null> {
  try {
    // Get token from cookie
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return null
    }

    // Verify token
    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    if (!user || !user.isActive) {
      return null
    }

    return user
  } catch (error) {
    console.error("Get auth error:", error)
    return null
  }
}

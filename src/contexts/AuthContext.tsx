"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  email: string
  name?: string
  phone?: string
  role: string
  isActive: boolean
  createdAt: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
}

interface AuthContextType {
  state: AuthState
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    email: string
    password: string
    name?: string
    phone?: string
  }) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true
  })
  
  const { toast } = useToast()

  const refreshUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const { user } = await response.json()
        setState(prev => ({ ...prev, user, isLoading: false }))
      } else {
        setState(prev => ({ ...prev, user: null, isLoading: false }))
      }
    } catch (error) {
      setState(prev => ({ ...prev, user: null, isLoading: false }))
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      setState(prev => ({ ...prev, user: data.user }))
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed"
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive"
      })
      throw error
    }
  }

  const register = async (userData: {
    email: string
    password: string
    name?: string
    phone?: string
  }) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      setState(prev => ({ ...prev, user: data.user }))
      toast({
        title: "Account created!",
        description: "Welcome to Ishq-e-Libas. Your account has been created successfully.",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed"
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive"
      })
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST"
      })

      setState(prev => ({ ...prev, user: null }))
      toast({
        title: "Goodbye!",
        description: "You have been successfully logged out.",
      })
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout failed",
        description: "There was an error logging you out.",
        variant: "destructive"
      })
    }
  }

  return (
    <AuthContext.Provider value={{
      state,
      login,
      register,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
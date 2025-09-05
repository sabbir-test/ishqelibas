"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Shield } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { state } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check if user is authenticated and has admin role
    const checkAdminAccess = () => {
      if (!state.isLoading) {
        if (!state.user) {
          redirect("/login")
        } else if (state.user.role !== "ADMIN") {
          redirect("/?error=unauthorized")
        }
        setIsChecking(false)
      }
    }

    checkAdminAccess()
  }, [state.user, state.isLoading])

  if (state.isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    )
  }

  if (!state.user || state.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-600">
                You don't have permission to access the admin area.
              </p>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Only administrators can access this page.
            </p>
            <button
              onClick={() => redirect("/")}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              Return to Home
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {children}
    </div>
  )
}
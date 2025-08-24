"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("demo@example.com")
  const [password, setPassword] = useState("demo123")
  const [isAdminLogin, setIsAdminLogin] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Login successful!",
          description: `Welcome back, ${data.user.name}!`,
        })
        
        // Redirect based on user role
        if (data.user.role === "ADMIN") {
          router.push("/admin")
        } else {
          router.push("/custom-design")
        }
      } else {
        toast({
          title: "Login failed",
          description: data.error || "Invalid credentials",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Demo Info Banner */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900">Demo Accounts</h3>
              <p className="text-sm text-blue-700 mt-1">
                Use the credentials below to test the application:
              </p>
              
              {/* Toggle between user and admin demo */}
              <div className="mt-3">
                <div className="flex space-x-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminLogin(false)
                      setEmail("demo@example.com")
                      setPassword("demo123")
                    }}
                    className={`px-3 py-1 text-xs rounded-md ${
                      !isAdminLogin 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    User Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminLogin(true)
                      setEmail("admin@ishqelibas.com")
                      setPassword("admin123")
                    }}
                    className={`px-3 py-1 text-xs rounded-md ${
                      isAdminLogin 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Admin Demo
                  </button>
                </div>
                
                <div className="text-xs font-mono bg-blue-100 p-2 rounded">
                  {isAdminLogin ? (
                    <>
                      <strong>Admin Account:</strong><br />
                      Email: admin@ishqelibas.com<br />
                      Password: admin123
                    </>
                  ) : (
                    <>
                      <strong>User Account:</strong><br />
                      Email: demo@example.com<br />
                      Password: demo123
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome to Ishq-e-Libas
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isAdminLogin ? "Admin Sign In" : "Sign in to access custom blouse design"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className={`w-full ${isAdminLogin ? "bg-purple-600 hover:bg-purple-700" : "bg-pink-600 hover:bg-pink-700"}`}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : isAdminLogin ? "Admin Sign In" : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Highlight */}
        <div className="mt-6 grid grid-cols-1 gap-3">
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 text-sm">🎨 Custom Design</h4>
            <p className="text-xs text-gray-600 mt-1">Create your perfect custom-fit blouse</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 text-sm">📏 Professional Measurements</h4>
            <p className="text-xs text-gray-600 mt-1">Expert measurement service available</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 text-sm">🛍️ Easy Shopping</h4>
            <p className="text-xs text-gray-600 mt-1">Seamless cart and checkout experience</p>
          </div>
        </div>
      </div>
    </div>
  )
}
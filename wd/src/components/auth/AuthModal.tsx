"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  })
  
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateLoginForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!loginForm.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
      newErrors.email = "Email is invalid"
    }
    
    if (!loginForm.password) {
      newErrors.password = "Password is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateRegisterForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!registerForm.name) {
      newErrors.name = "Name is required"
    }
    
    if (!registerForm.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
      newErrors.email = "Email is invalid"
    }
    
    if (!registerForm.password) {
      newErrors.password = "Password is required"
    } else if (registerForm.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateLoginForm()) return
    
    setIsLoading(true)
    try {
      await login(loginForm.email, loginForm.password)
      onClose()
    } catch (error) {
      // Error is already handled by the auth context
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateRegisterForm()) return
    
    setIsLoading(true)
    try {
      await register({
        email: registerForm.email,
        password: registerForm.password,
        name: registerForm.name,
        phone: registerForm.phone
      })
      onClose()
    } catch (error) {
      // Error is already handled by the auth context
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">Welcome to Ishq-e-Libas</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sign In to Your Account</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="login-email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10"
                            value={loginForm.email}
                            onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                        {errors.email && (
                          <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {errors.email}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="login-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="pl-10 pr-10"
                            value={loginForm.password}
                            onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {errors.password && (
                          <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {errors.password}
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-pink-600 hover:bg-pink-700"
                        disabled={isLoading}
                      >
                        {isLoading ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Create Your Account</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <Label htmlFor="register-name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="register-name"
                            type="text"
                            placeholder="Enter your full name"
                            className="pl-10"
                            value={registerForm.name}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        {errors.name && (
                          <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {errors.name}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="register-email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10"
                            value={registerForm.email}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                        {errors.email && (
                          <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {errors.email}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="register-phone">Phone Number (Optional)</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="register-phone"
                            type="tel"
                            placeholder="Enter your phone number"
                            className="pl-10"
                            value={registerForm.phone}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="register-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            className="pl-10 pr-10"
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {errors.password && (
                          <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {errors.password}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="register-confirm-password">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="register-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            className="pl-10 pr-10"
                            value={registerForm.confirmPassword}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {errors.confirmPassword && (
                          <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {errors.confirmPassword}
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-pink-600 hover:bg-pink-700"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="text-center text-sm text-gray-600">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
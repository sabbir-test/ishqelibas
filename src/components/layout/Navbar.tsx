"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  Search, 
  ShoppingCart, 
  User, 
  Heart, 
  Menu, 
  X,
  Home,
  ShoppingBag,
  Grid3X3,
  Info,
  Phone,
  LogOut,
  Scissors,
  Settings
} from "lucide-react"
import Image from "next/image"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import CartDrawer from "@/components/cart/CartDrawer"
import AuthModal from "@/components/auth/AuthModal"
import { ErrorBoundary } from "@/components/ui/error-boundary"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { state, toggleCart } = useCart()
  const { state: authState, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Shop", href: "/categories", icon: ShoppingBag },
    { name: "Categories", href: "/categories", icon: Grid3X3 },
    { name: "Custom Design", href: "/custom-design", icon: Scissors },
    { name: "About Us", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Phone },
  ]

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-10 h-10">
              <Image
                src="/logo.svg"
                alt="Ishq-e-Libas"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-pink-600">Ishq-e-Libas</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-pink-600 transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search products..."
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Search Icon - Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* User Account */}
            {authState.user ? (
              <div className="relative group">
                <Button variant="ghost" size="icon" className="relative">
                  <User className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-xs bg-green-500">
                    ✓
                  </Badge>
                </Button>
                
                {/* User Dropdown */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-4 border-b">
                    <div className="font-medium text-gray-900">
                      {authState.user.name || "User"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {authState.user.email}
                    </div>
                    <Badge variant="secondary" className="mt-1">
                      {authState.user.role}
                    </Badge>
                  </div>
                  
                  <div className="p-2">
                    <Link href="/account">
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        My Account
                      </Button>
                    </Link>
                    {authState.user.role === "ADMIN" && (
                      <Link href="/admin">
                        <Button variant="ghost" className="w-full justify-start">
                          <Settings className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Button>
                      </Link>
                    )}
                    <Link href="/orders">
                      <Button variant="ghost" className="w-full justify-start">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        My Orders
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600 hover:text-red-700"
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setIsAuthModalOpen(true)}>
                <User className="h-5 w-5" />
              </Button>
            )}

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5" />
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                0
              </Badge>
            </Button>

            {/* Shopping Cart */}
            <Button variant="ghost" size="icon" className="relative" onClick={toggleCart}>
              <ShoppingCart className="h-5 w-5" />
              {state.itemCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                  {state.itemCount}
                </Badge>
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-lg font-semibold">Menu</span>
                  </div>
                  
                  {/* Mobile Search */}
                  <div className="mb-6">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search products..."
                        className="pr-10"
                      />
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </nav>

                  {/* Mobile Account Actions */}
                  <div className="border-t pt-4 space-y-2">
                    {authState.user ? (
                      <>
                        <div className="px-4 py-2 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-900">
                            {authState.user.name || "User"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {authState.user.email}
                          </div>
                        </div>
                        <Link href="/account">
                          <Button variant="outline" className="w-full justify-start">
                            <User className="h-4 w-4 mr-2" />
                            My Account
                          </Button>
                        </Link>
                        {authState.user.role === "ADMIN" && (
                          <Link href="/admin">
                            <Button variant="outline" className="w-full justify-start">
                              <Settings className="h-4 w-4 mr-2" />
                              Admin Dashboard
                            </Button>
                          </Link>
                        )}
                        <Link href="/orders">
                          <Button variant="outline" className="w-full justify-start">
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            My Orders
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-red-600 hover:text-red-700"
                          onClick={logout}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => {
                          setIsAuthModalOpen(true)
                          setMobileMenuOpen(false)
                        }}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Sign In / Register
                      </Button>
                    )}
                    <Button variant="outline" className="w-full justify-start">
                      <Heart className="h-4 w-4 mr-2" />
                      Wishlist
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="lg:hidden pb-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                className="pr-10"
                autoFocus
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>
        )}
      </div>
    </header>
    
    {/* Cart Drawer */}
    <ErrorBoundary>
      <CartDrawer />
    </ErrorBoundary>
    
      {/* Auth Modal */}
    <AuthModal 
      isOpen={isAuthModalOpen} 
      onClose={() => setIsAuthModalOpen(false)} 
    />
    </>
  )
}
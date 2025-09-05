"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Send,
  Heart,
  CreditCard,
  Truck,
  Shield,
  RotateCcw,
  Gift,
  Star
} from "lucide-react"

export default function Footer() {
  const [email, setEmail] = useState("")

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log("Subscribed email:", email)
    setEmail("")
  }

  const footerLinks = {
    shop: [
      { name: "New Arrivals", href: "/new-arrivals" },
      { name: "Best Sellers", href: "/best-sellers" },
      { name: "Sarees", href: "/categories/sarees" },
      { name: "Kurtis", href: "/categories/kurtis" },
      { name: "Lehengas", href: "/categories/lehengas" },
      { name: "Custom Design", href: "/custom-design" }
    ],
    help: [
      { name: "Track Order", href: "/track-order" },
      { name: "Shipping Info", href: "/shipping" },
      { name: "Returns & Exchanges", href: "/returns" },
      { name: "Size Guide", href: "/size-guide" },
      { name: "Contact Us", href: "/contact" },
      { name: "FAQs", href: "/faq" }
    ],
    about: [
      { name: "Our Story", href: "/about" },
      { name: "Quality Promise", href: "/quality" },
      { name: "Sustainability", href: "/sustainability" },
      { name: "Artisans", href: "/artisans" },
      { name: "Press", href: "/press" },
      { name: "Careers", href: "/careers" }
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "Disclaimer", href: "/disclaimer" },
      { name: "Refund Policy", href: "/refund" },
      { name: "Shipping Policy", href: "/shipping-policy" }
    ]
  }

  const services = [
    { icon: <Truck className="h-6 w-6" />, title: "Free Shipping", description: "On orders above ₹999" },
    { icon: <RotateCcw className="h-6 w-6" />, title: "Easy Returns", description: "30-day return policy" },
    { icon: <Shield className="h-6 w-6" />, title: "Secure Payment", description: "100% secure transactions" },
    { icon: <Gift className="h-6 w-6" />, title: "Gift Cards", description: "Perfect gift for loved ones" }
  ]

  const paymentMethods = [
    { name: "Razorpay", icon: "💳" },
    { name: "Visa", icon: "💳" },
    { name: "Mastercard", icon: "💳" },
    { name: "COD", icon: "💵" },
    { name: "UPI", icon: "📱" },
    { name: "Net Banking", icon: "🏦" }
  ]

  const socialLinks = [
    { name: "Facebook", icon: <Facebook className="h-5 w-5" />, href: "#" },
    { name: "Instagram", icon: <Instagram className="h-5 w-5" />, href: "#" },
    { name: "Twitter", icon: <Twitter className="h-5 w-5" />, href: "#" },
    { name: "YouTube", icon: <Youtube className="h-5 w-5" />, href: "#" }
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Services Section */}
      <div className="py-12 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center">
                    {service.icon}
                  </div>
                </div>
                <h3 className="font-semibold mb-1">{service.title}</h3>
                <p className="text-sm text-gray-400">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">Ishq-e-Libas</span>
              </div>
              <p className="text-gray-400 mb-6">
                Celebrating the art of women's fashion with exquisite designs that blend tradition and contemporary style.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-400">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">support@ishqelibas.com</span>
                </div>
                <div className="flex items-start gap-3 text-gray-400">
                  <MapPin className="h-4 w-4 mt-1" />
                  <span className="text-sm">123 Fashion Street, Mumbai, Maharashtra 400001</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-3 mt-6">
                {socialLinks.map((social, index) => (
                  <Link
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>

            {/* Shop Links */}
            <div>
              <h3 className="font-semibold mb-4">Shop</h3>
              <ul className="space-y-3">
                {footerLinks.shop.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-pink-400 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help Links */}
            <div>
              <h3 className="font-semibold mb-4">Help</h3>
              <ul className="space-y-3">
                {footerLinks.help.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-pink-400 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="font-semibold mb-4">Stay Connected</h3>
              <p className="text-gray-400 text-sm mb-4">
                Subscribe to get special offers, style updates, and 10% off your first order.
              </p>
              
              <form onSubmit={handleSubscribe} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  required
                />
                <Button 
                  type="submit"
                  className="w-full bg-pink-600 hover:bg-pink-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Subscribe
                </Button>
              </form>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Download Our App</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">📱</span>
                      <div className="text-left">
                        <div className="text-xs">Get it on</div>
                        <div className="text-sm font-semibold">Google Play</div>
                      </div>
                    </div>
                  </Button>
                  <Button variant="outline" className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">🍎</span>
                      <div className="text-left">
                        <div className="text-xs">Download on the</div>
                        <div className="text-sm font-semibold">App Store</div>
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-800" />

      {/* Bottom Footer */}
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © 2024 Ishq-e-Libas. All rights reserved. Made with <Heart className="h-4 w-4 inline text-pink-600" /> in India
              </p>
            </div>

            {/* Payment Methods */}
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-gray-400 text-sm">We Accept:</span>
              <div className="flex gap-2">
                {paymentMethods.map((method, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                  >
                    {method.icon} {method.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex gap-6">
              {footerLinks.legal.slice(0, 3).map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-gray-400 hover:text-pink-400 transition-colors text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
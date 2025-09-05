"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  MessageCircle,
  HelpCircle,
  Star,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import Image from "next/image"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

interface ContactInfo {
  icon: React.ReactNode
  title: string
  details: string[]
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  const contactInfo: ContactInfo[] = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Visit Our Store",
      details: [
        "123 Fashion Street, Andheri West",
        "Mumbai, Maharashtra 400053",
        "India"
      ]
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Call Us",
      details: [
        "+91 98765 43210",
        "+91 22 2345 6789",
        "Mon-Sat: 10AM - 8PM",
        "Sun: 11AM - 6PM"
      ]
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Us",
      details: [
        "info@ishqelibas.com",
        "support@ishqelibas.com",
        "orders@ishqelibas.com",
        "customcare@ishqelibas.com"
      ]
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Business Hours",
      details: [
        "Monday - Saturday: 10AM - 8PM",
        "Sunday: 11AM - 6PM",
        "Online Store: 24/7",
        "Customer Support: 9AM - 9PM"
      ]
    }
  ]

  const faqs: FAQ[] = [
    {
      id: "1",
      question: "How do I track my order?",
      answer: "Once your order is shipped, you'll receive a tracking number via email. You can use this number to track your order on our website or the courier company's website.",
      category: "Order Tracking"
    },
    {
      id: "2",
      question: "What is your return policy?",
      answer: "We offer a 15-day return policy for most items. Items must be unused, in original packaging, and accompanied by the original receipt. Custom-made items are non-returnable.",
      category: "Returns & Exchanges"
    },
    {
      id: "3",
      question: "Do you ship internationally?",
      answer: "Yes, we ship to over 15 countries worldwide. International shipping rates and delivery times vary by destination. Customs duties may apply.",
      category: "Shipping"
    },
    {
      id: "4",
      question: "How can I customize my blouse design?",
      answer: "You can use our Custom Design feature on the website to create your perfect blouse. Choose from various fabrics, designs, and measurements. Our team will contact you to confirm details.",
      category: "Custom Design"
    },
    {
      id: "5",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, UPI, net banking, and cash on delivery (for select locations). All payments are secure and encrypted.",
      category: "Payment"
    },
    {
      id: "6",
      question: "How do I care for my ethnic wear?",
      answer: "Most of our garments come with care labels. Generally, we recommend dry cleaning for silk and embroidered items, and gentle hand washing for cotton pieces. Always store in a cool, dry place.",
      category: "Product Care"
    }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitStatus("success")
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      })
      
      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus("idle"), 5000)
    }, 2000)
  }

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
  }

  const categories = Array.from(new Set(faqs.map(faq => faq.category)))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl mb-8 text-pink-100">
              We're here to help! Get in touch with us for any questions, concerns, or feedback.
            </p>
            <div className="flex flex-wrap gap-4">
              <Badge variant="secondary" className="text-white bg-white bg-opacity-20 text-lg px-4 py-2">
                <MessageCircle className="h-4 w-4 mr-2" />
                24/7 Customer Support
              </Badge>
              <Badge variant="secondary" className="text-white bg-white bg-opacity-20 text-lg px-4 py-2">
                <Star className="h-4 w-4 mr-2" />
                50,000+ Happy Customers
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-pink-100 rounded-lg p-3">
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
                        <div className="space-y-1">
                          {info.details.map((detail, idx) => (
                            <p key={idx} className="text-gray-600 text-sm">{detail}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Map */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Find Us Here</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden">
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-4">
                      <MapPin className="h-6 w-6 text-pink-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">123 Fashion Street, Mumbai</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help Center
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Live Chat
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Star className="h-4 w-4 mr-2" />
                    Write a Review
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Report an Issue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form and FAQ */}
          <div className="lg:col-span-2 space-y-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </CardHeader>
              <CardContent>
                {submitStatus === "success" && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Message sent successfully!</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      We'll get back to you within 24 hours.
                    </p>
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">Something went wrong!</span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">
                      Please try again or call us directly.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="What is this regarding?"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-pink-600 hover:bg-pink-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              
              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedFAQ(null)}
                >
                  All Categories
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const categoryFAQs = faqs.filter(faq => faq.category === category)
                      if (categoryFAQs.length > 0) {
                        setExpandedFAQ(categoryFAQs[0].id)
                      }
                    }}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <Card key={faq.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className="w-full text-left flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{faq.question}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {faq.category}
                            </Badge>
                          </div>
                          {expandedFAQ === faq.id && (
                            <p className="text-gray-600 mt-2">{faq.answer}</p>
                          )}
                        </div>
                        <div className="ml-4">
                          {expandedFAQ === faq.id ? (
                            <div className="bg-pink-100 rounded-full p-1">
                              <div className="w-4 h-0.5 bg-pink-600"></div>
                            </div>
                          ) : (
                            <div className="bg-pink-100 rounded-full p-1">
                              <div className="w-4 h-0.5 bg-pink-600 transform rotate-90"></div>
                            </div>
                          )}
                        </div>
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-red-50 border-y border-red-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-red-800 mb-2">Need Immediate Assistance?</h3>
            <p className="text-red-700 mb-4">
              For urgent matters, please call our emergency support line:
            </p>
            <div className="flex items-center justify-center gap-2">
              <Phone className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold text-red-600">+91 98765 43210</span>
            </div>
            <p className="text-red-600 text-sm mt-2">Available 24/7 for urgent inquiries</p>
          </div>
        </div>
      </div>
    </div>
  )
}
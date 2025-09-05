"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Send,
  MessageCircle,
  HelpCircle,
  Truck,
  RefreshCw,
  Ruler,
  Shield
} from "lucide-react"

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log("Form submitted:", formData)
    // Reset form
    setFormData({ name: "", email: "", phone: "", message: "" })
  }

  const faqItems = [
    {
      question: "What are your shipping options?",
      answer: "We offer free shipping on orders above ₹999. For orders below ₹999, standard shipping charges of ₹99 apply. We also provide express shipping options at additional cost. Delivery typically takes 3-7 business days for standard shipping.",
      icon: <Truck className="h-5 w-5" />
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for all unused products in their original packaging. Items must be returned with all tags attached. Refunds are processed within 5-7 business days after we receive the returned item.",
      icon: <RefreshCw className="h-5 w-5" />
    },
    {
      question: "How do I choose the right size?",
      answer: "Each product has a detailed size chart in the description. We recommend measuring yourself and comparing with our size guide. For custom blouses, we provide measurement instructions and also offer virtual measurement appointments.",
      icon: <Ruler className="h-5 w-5" />
    },
    {
      question: "Is my payment information secure?",
      answer: "Yes, we use industry-standard encryption and security measures to protect your payment information. We partner with Razorpay for secure payment processing and do not store your credit card details on our servers.",
      icon: <Shield className="h-5 w-5" />
    },
    {
      question: "How long does custom blouse design take?",
      answer: "Custom blouse designs typically take 7-14 days for production, depending on the complexity of the design and fabric availability. You'll receive updates on your order status throughout the process.",
      icon: <MessageCircle className="h-5 w-5" />
    },
    {
      question: "Do you offer international shipping?",
      answer: "Currently, we ship within India only. We're working on expanding our shipping options to include international destinations. Please sign up for our newsletter to stay updated on our shipping expansions.",
      icon: <MapPin className="h-5 w-5" />
    }
  ]

  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Phone",
      value: "+91 98765 43210",
      description: "Mon-Sat: 10AM-7PM"
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      value: "support@ishqelibas.com",
      description: "We respond within 24hrs"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Address",
      value: "123 Fashion Street, Mumbai, Maharashtra 400001",
      description: "Visit our flagship store"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Business Hours",
      value: "10:00 AM - 7:00 PM",
      description: "Monday to Saturday"
    }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're here to help! Whether you have a question about our products, need help with an order, or want to share your feedback.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-6 w-6 text-pink-600" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
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
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us how we can help you..."
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-pink-600 hover:bg-pink-700"
                    size="lg"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-6 w-6 text-pink-600" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-center gap-3">
                          {faq.icon}
                          <span>{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {contactInfo.map((info, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-pink-600">
                        {info.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{info.title}</h4>
                        <p className="text-sm text-gray-600 font-medium">{info.value}</p>
                        <p className="text-xs text-gray-500">{info.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Live Chat CTA */}
            <div className="mt-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Need Immediate Help?</h4>
                  <p className="text-sm opacity-90">Chat with our support team now</p>
                </div>
                <Badge className="bg-white text-pink-600 hover:bg-gray-100 cursor-pointer">
                  Live Chat
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
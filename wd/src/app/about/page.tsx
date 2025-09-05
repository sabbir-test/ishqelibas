"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  Award, 
  Users, 
  TrendingUp, 
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Target,
  Lightbulb
} from "lucide-react"
import Image from "next/image"

interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  image: string
}

interface Milestone {
  year: string
  title: string
  description: string
}

interface Value {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<"story" | "team" | "values">("story")

  const teamMembers: TeamMember[] = [
    {
      id: "1",
      name: "Priya Sharma",
      role: "Founder & CEO",
      bio: "With over 15 years of experience in the fashion industry, Priya founded Ishq-e-Libas to bring traditional Indian wear to the modern woman.",
      image: ""
    },
    {
      id: "2",
      name: "Ananya Patel",
      role: "Creative Director",
      bio: "Ananya brings her expertise in textile design and fashion forecasting to create collections that blend tradition with contemporary trends.",
      image: ""
    },
    {
      id: "3",
      name: "Rahul Verma",
      role: "Operations Manager",
      bio: "Rahul ensures smooth operations and logistics, making sure every customer receives their order on time and in perfect condition.",
      image: ""
    },
    {
      id: "4",
      name: "Sneha Reddy",
      role: "Customer Experience Head",
      bio: "Sneha leads our customer service team, ensuring every interaction with Ishq-e-Libas is delightful and memorable.",
      image: ""
    }
  ]

  const milestones: Milestone[] = [
    {
      year: "2015",
      title: "The Beginning",
      description: "Ishq-e-Libas was founded with a vision to make traditional Indian wear accessible to women worldwide."
    },
    {
      year: "2017",
      title: "First Store Opening",
      description: "Opened our first flagship store in Mumbai, bringing our collections closer to our customers."
    },
    {
      year: "2019",
      title: "Online Launch",
      description: "Launched our e-commerce platform, reaching customers across India and internationally."
    },
    {
      year: "2021",
      title: "Expansion",
      description: "Expanded our product range to include custom blouse designs and festive collections."
    },
    {
      year: "2023",
      title: "Sustainability Initiative",
      description: "Launched our sustainable fashion line, committed to eco-friendly practices."
    },
    {
      year: "2024",
      title: "Global Reach",
      description: "Now serving customers in over 15 countries, celebrating Indian fashion globally."
    }
  ]

  const values: Value[] = [
    {
      id: "1",
      title: "Quality Craftsmanship",
      description: "Every piece is crafted with attention to detail, using the finest materials and traditional techniques.",
      icon: <Award className="h-8 w-8" />
    },
    {
      id: "2",
      title: "Customer First",
      description: "Our customers are at the heart of everything we do. We strive to provide exceptional service and experiences.",
      icon: <Heart className="h-8 w-8" />
    },
    {
      id: "3",
      title: "Innovation",
      description: "We continuously innovate to bring fresh designs and improve our shopping experience.",
      icon: <Lightbulb className="h-8 w-8" />
    },
    {
      id: "4",
      title: "Sustainability",
      description: "Committed to environmentally responsible practices and ethical sourcing of materials.",
      icon: <Target className="h-8 w-8" />
    }
  ]

  const stats = [
    { label: "Happy Customers", value: "50,000+", icon: <Users className="h-6 w-6" /> },
    { label: "Products", value: "1000+", icon: <TrendingUp className="h-6 w-6" /> },
    { label: "Cities Served", value: "200+", icon: <MapPin className="h-6 w-6" /> },
    { label: "Years of Excellence", value: "9+", icon: <Award className="h-6 w-6" /> }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-pink-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Ishq-e-Libas</h1>
            <p className="text-xl mb-8 text-pink-100">
              Where tradition meets contemporary fashion, celebrating the essence of Indian ethnic wear for the modern woman.
            </p>
            <div className="flex flex-wrap gap-4">
              <Badge variant="secondary" className="text-white bg-white bg-opacity-20 text-lg px-4 py-2">
                <Star className="h-4 w-4 mr-2" />
                Trusted by 50,000+ Customers
              </Badge>
              <Badge variant="secondary" className="text-white bg-white bg-opacity-20 text-lg px-4 py-2">
                <Award className="h-4 w-4 mr-2" />
                Premium Quality
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-pink-100 rounded-full p-3">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-pink-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 rounded-lg p-1 inline-flex">
            <Button
              variant={activeTab === "story" ? "default" : "ghost"}
              onClick={() => setActiveTab("story")}
              className="rounded-md"
            >
              Our Story
            </Button>
            <Button
              variant={activeTab === "team" ? "default" : "ghost"}
              onClick={() => setActiveTab("team")}
              className="rounded-md"
            >
              Our Team
            </Button>
            <Button
              variant={activeTab === "values" ? "default" : "ghost"}
              onClick={() => setActiveTab("values")}
              className="rounded-md"
            >
              Our Values
            </Button>
          </div>
        </div>

        {/* Story Section */}
        {activeTab === "story" && (
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Journey</h2>
                <p className="text-gray-600 mb-4">
                  Ishq-e-Libas began with a simple yet powerful vision: to make traditional Indian ethnic wear accessible to every woman who appreciates the beauty of our cultural heritage. Founded in 2015, we started as a small boutique in Mumbai with a curated collection of handpicked sarees and salwar kameez.
                </p>
                <p className="text-gray-600 mb-4">
                  Today, we've grown into a comprehensive fashion destination that celebrates the diversity of Indian fashion while embracing contemporary design sensibilities. Our journey has been marked by countless happy customers, numerous design innovations, and an unwavering commitment to quality.
                </p>
                <p className="text-gray-600">
                  At Ishq-e-Libas, we believe that clothing is more than just fabric – it's an expression of identity, culture, and personal style. Every piece in our collection tells a story of craftsmanship, tradition, and the timeless beauty of Indian fashion.
                </p>
              </div>
                <div className="relative h-96">
                  <div className="w-full h-full bg-gray-200 rounded-lg shadow-lg flex items-center justify-center">
                    <span className="text-gray-500">Store Image</span>
                  </div>
                </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-2xl font-bold mb-8 text-center">Our Milestones</h3>
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="bg-pink-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold">
                        {milestone.year}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold mb-2">{milestone.title}</h4>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Team Section */}
        {activeTab === "team" && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our passionate team of fashion enthusiasts, designers, and customer service experts work together to bring you the best in Indian ethnic wear.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member) => (
                <Card key={member.id} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-xs">Photo</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                    <p className="text-pink-600 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Culture Section */}
            <div className="mt-16 bg-pink-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Our Culture</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-pink-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Passion for Fashion</h4>
                  <p className="text-gray-600 text-sm">We live and breathe fashion, constantly exploring new trends and traditional techniques.</p>
                </div>
                <div className="text-center">
                  <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-pink-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Team Collaboration</h4>
                  <p className="text-gray-600 text-sm">We believe in the power of teamwork and collaborative creativity.</p>
                </div>
                <div className="text-center">
                  <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-pink-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Excellence</h4>
                  <p className="text-gray-600 text-sm">We strive for excellence in everything we do, from design to customer service.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Values Section */}
        {activeTab === "values" && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
              <p className="text-gray-600">
                These principles guide every decision we make and every action we take at Ishq-e-Libas.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {values.map((value) => (
                <Card key={value.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-pink-100 rounded-lg p-3">
                        {value.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                        <p className="text-gray-600">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Commitment Section */}
            <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Our Commitment</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold mb-3">To Our Customers</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Premium quality products</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Exceptional customer service</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Secure and convenient shopping</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Timely delivery</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-3">To Our Community</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Supporting local artisans</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Promoting traditional crafts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Sustainable practices</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Cultural preservation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact CTA */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Have questions about our story or want to learn more about our collections? We'd love to hear from you!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>info@ishqelibas.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Mon-Sat: 10AM - 8PM</span>
            </div>
          </div>
          <Button className="mt-6 bg-pink-600 hover:bg-pink-700">
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  )
}
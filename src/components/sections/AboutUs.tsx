"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  Users, 
  Award, 
  Target,
  Sparkles,
  Leaf,
  Clock,
  Star
} from "lucide-react"
import Image from "next/image"

export default function AboutUs() {
  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Crafted with Love",
      description: "Every piece is made with attention to detail and passion for excellence."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Artisan Excellence",
      description: "Supporting skilled artisans and preserving traditional craftsmanship."
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Quality Guaranteed",
      description: "Premium fabrics and meticulous quality control for lasting beauty."
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Customer First",
      description: "Your satisfaction is our priority, with personalized service always."
    }
  ]

  const stats = [
    { number: "10K+", label: "Happy Customers" },
    { number: "500+", label: "Unique Designs" },
    { number: "50+", label: "Artisans" },
    { number: "5+", label: "Years Excellence" }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">About Ishq-e-Libas</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Where tradition meets contemporary fashion, creating timeless elegance for the modern woman.
          </p>
        </div>

        {/* Split Screen Design */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Side - Brand Story */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-pink-600" />
              <Badge className="bg-pink-100 text-pink-700">Our Story</Badge>
            </div>
            
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Celebrating the Art of Women's Fashion
            </h3>
            
            <div className="space-y-4 text-gray-600">
              <p className="text-lg leading-relaxed">
                Founded with a vision to bring traditional Indian fashion to the modern woman, Ishq-e-Libas has grown from a small boutique to a beloved destination for exquisite women's wear.
              </p>
              
              <p className="text-lg leading-relaxed">
                Our journey began with a simple belief: every woman deserves to feel beautiful, confident, and connected to her cultural roots through her clothing. We work directly with skilled artisans across India to bring you authentic, handcrafted pieces that tell a story.
              </p>
              
              <p className="text-lg leading-relaxed">
                From elegant sarees to contemporary fusion wear, each collection is carefully curated to blend traditional craftsmanship with modern aesthetics, ensuring you find the perfect outfit for every occasion.
              </p>
            </div>

            {/* Values */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center p-4 hover:shadow-md transition-shadow">
                  <CardContent className="space-y-2">
                    <div className="flex justify-center text-pink-600">
                      {value.icon}
                    </div>
                    <h4 className="font-semibold text-gray-900">{value.title}</h4>
                    <p className="text-sm text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/api/placeholder/600/600"
                alt="Ishq-e-Libas Team"
                fill
                className="object-cover"
              />
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-pink-200 rounded-full opacity-50" />
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-purple-200 rounded-full opacity-50" />
            
            {/* Experience Badge */}
            <div className="absolute top-4 right-4">
              <Card className="bg-white shadow-lg">
                <CardContent className="p-4 flex items-center gap-3">
                  <Clock className="h-8 w-8 text-pink-600" />
                  <div>
                    <p className="text-sm text-gray-600">Years of</p>
                    <p className="font-bold text-gray-900">Excellence</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-2">
                <div className="text-3xl font-bold text-pink-600">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8 md:p-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <Star className="h-12 w-12 text-pink-600" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Our Mission
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              To empower women through fashion by providing high-quality, affordable, and stylish clothing that celebrates both tradition and modernity. We are committed to sustainable practices, supporting local artisans, and creating a shopping experience that makes every woman feel special and confident.
            </p>
            <div className="flex justify-center gap-2 mt-6">
              <Badge className="bg-green-100 text-green-700">
                <Leaf className="h-4 w-4 mr-1" />
                Sustainable
              </Badge>
              <Badge className="bg-blue-100 text-blue-700">
                <Users className="h-4 w-4 mr-1" />
                Community Focused
              </Badge>
              <Badge className="bg-purple-100 text-purple-700">
                <Heart className="h-4 w-4 mr-1" />
                Made with Love
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
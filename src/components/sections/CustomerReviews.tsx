"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  ChevronRight, 
  Star,
  StarHalf,
  Quote
} from "lucide-react"
import Image from "next/image"

interface Review {
  id: string
  name: string
  avatar: string
  rating: number
  review: string
  date: string
  location: string
  product?: string
}

export default function CustomerReviews() {
  const [currentReview, setCurrentReview] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const reviews: Review[] = [
    {
      id: "1",
      name: "Priya Sharma",
      avatar: "/api/placeholder/80/80",
      rating: 5,
      review: "Absolutely love the saree I purchased! The quality is exceptional and the embroidery is so intricate. It was perfect for my friend's wedding. Will definitely shop here again!",
      date: "2 weeks ago",
      location: "Mumbai, Maharashtra",
      product: "Elegant Silk Saree"
    },
    {
      id: "2",
      name: "Ananya Reddy",
      avatar: "/api/placeholder/80/80",
      rating: 4.5,
      review: "The custom blouse service is outstanding! They helped me design the perfect blouse for my saree. The fit is amazing and the craftsmanship is top-notch. Highly recommended!",
      date: "1 month ago",
      location: "Hyderabad, Telangana",
      product: "Custom Blouse Design"
    },
    {
      id: "3",
      name: "Meera Patel",
      avatar: "/api/placeholder/80/80",
      rating: 5,
      review: "Ishq-e-Libas has become my go-to store for ethnic wear. The kurtis are so comfortable yet stylish. The customer service is also excellent. Thank you for the amazing shopping experience!",
      date: "3 weeks ago",
      location: "Ahmedabad, Gujarat",
      product: "Designer Kurti Set"
    },
    {
      id: "4",
      name: "Sneha Nair",
      avatar: "/api/placeholder/80/80",
      rating: 4.8,
      review: "The lehenga I bought for my wedding was beyond my expectations! The quality, the design, everything was perfect. I received so many compliments. Worth every penny!",
      date: "2 months ago",
      location: "Kochi, Kerala",
      product: "Bridal Lehenga"
    },
    {
      id: "5",
      name: "Ritu Singh",
      avatar: "/api/placeholder/80/80",
      rating: 5,
      review: "Fast delivery and excellent packaging! The dress was exactly as shown in the pictures. The fabric quality is superb and the fit is perfect. Very satisfied with my purchase!",
      date: "1 week ago",
      location: "Delhi, NCR",
      product: "Casual Cotton Dress"
    }
  ]

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, reviews.length])

  const nextReview = () => {
    setCurrentReview((prev) => (prev + 1) % reviews.length)
    setIsAutoPlaying(false)
  }

  const prevReview = () => {
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length)
    setIsAutoPlaying(false)
  }

  const goToReview = (index: number) => {
    setCurrentReview(index)
    setIsAutoPlaying(false)
  }

  const renderStars = (rating: number) => {
    const stars: React.JSX.Element[] = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="w-5 h-5 fill-yellow-400 text-yellow-400" />)
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />)
    }

    return stars
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real experiences from real customers who have found their perfect style with Ishq-e-Libas.
          </p>
        </div>

        {/* Reviews Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Review Cards */}
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentReview * 100}%)` }}
              >
                {reviews.map((review) => (
                  <div key={review.id} className="w-full flex-shrink-0 px-4">
                    <Card className="p-8 md:p-12 text-center">
                      <CardContent className="space-y-6">
                        {/* Quote Icon */}
                        <div className="flex justify-center">
                          <Quote className="h-12 w-12 text-pink-200" />
                        </div>

                        {/* Rating */}
                        <div className="flex justify-center space-x-1">
                          {renderStars(review.rating)}
                        </div>

                        {/* Review Text */}
                        <blockquote className="text-lg md:text-xl text-gray-700 italic leading-relaxed max-w-2xl mx-auto">
                          "{review.review}"
                        </blockquote>

                        {/* Customer Info */}
                        <div className="flex items-center justify-center space-x-4">
                          <div className="relative w-16 h-16">
                            <Image
                              src={review.avatar}
                              alt={review.name}
                              fill
                              className="object-cover rounded-full"
                            />
                          </div>
                          <div className="text-left">
                            <h4 className="font-semibold text-gray-900">{review.name}</h4>
                            <p className="text-sm text-gray-600">{review.location}</p>
                            {review.product && (
                              <p className="text-sm text-pink-600">Purchased: {review.product}</p>
                            )}
                            <p className="text-xs text-gray-500">{review.date}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10"
              onClick={prevReview}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 md:translate-x-12 z-10"
              onClick={nextReview}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Indicators */}
          <div className="flex justify-center space-x-2 mt-8">
            {reviews.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentReview
                    ? "bg-pink-600 w-8"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                onClick={() => goToReview(index)}
              />
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="text-center p-6">
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold text-pink-600">4.8</div>
              <div className="flex justify-center">
                {renderStars(4.8)}
              </div>
              <div className="text-gray-600">Average Rating</div>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6">
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold text-pink-600">2,500+</div>
              <div className="text-gray-600">Happy Customers</div>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6">
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold text-pink-600">98%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
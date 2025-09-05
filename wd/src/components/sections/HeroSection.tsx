"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const slides = [
    {
      id: 1,
      title: "Discover Elegance",
      subtitle: "Exquisite Women's Fashion Collection",
      description: "Embrace the beauty of traditional and contemporary designs crafted with love.",
      image: "/api/placeholder/1200/600",
      ctaText: "Shop Now",
      ctaLink: "/categories"
    },
    {
      id: 2,
      title: "Custom Blouse Design",
      subtitle: "Create Your Perfect Fit",
      description: "Design your dream blouse with our custom tailoring service.",
      image: "/api/placeholder/1200/600",
      ctaText: "Design Now",
      ctaLink: "/custom-design"
    },
    {
      id: 3,
      title: "Festive Collection 2024",
      subtitle: "Celebrate in Style",
      description: "New arrivals for the festive season with exclusive designs.",
      image: "/api/placeholder/1200/600",
      ctaText: "Explore Collection",
      ctaLink: "/categories"
    }
  ]

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, slides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
  }

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Background Image with Parallax Effect */}
            <div className="absolute inset-0">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black bg-opacity-40" />
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-4xl mx-auto">
                <div className="mb-4">
                  <div className="flex justify-center mb-4">
                    <Star className="h-8 w-8 text-yellow-400 fill-current" />
                  </div>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 animate-fade-in">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl lg:text-3xl mb-6 text-pink-200 animate-fade-in-up">
                    {slide.subtitle}
                  </p>
                  <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto animate-fade-in-up-delay">
                    {slide.description}
                  </p>
                </div>
                <Button
                  size="lg"
                  className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 text-lg animate-bounce-in"
                  asChild
                >
                  <Link href={slide.ctaLink}>{slide.ctaText}</Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20 z-10"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20 z-10"
        onClick={nextSlide}
      >
        <ChevronRight className="h-8 w-8" />
      </Button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white w-8"
                : "bg-white bg-opacity-50 hover:bg-opacity-75"
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-scroll" />
        </div>
      </div>
    </section>
  )
}
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Gift, 
  Clock, 
  Tag, 
  Sparkles,
  ArrowRight,
  Zap
} from "lucide-react"
import Link from "next/link"

export default function PromotionalBanner() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    // Set countdown to 7 days from now
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 7)

    const updateCountdown = () => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [])

  const offers = [
    {
      title: "Flash Sale",
      discount: "50% OFF",
      description: "On selected kurtis and dresses",
      icon: <Zap className="h-6 w-6" />,
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Festival Special",
      discount: "Buy 2 Get 1",
      description: "On all sarees and lehengas",
      icon: <Gift className="h-6 w-6" />,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "New User Offer",
      discount: "30% OFF",
      description: "On your first order above ₹1999",
      icon: <Tag className="h-6 w-6" />,
      color: "from-blue-500 to-cyan-500"
    }
  ]

  return (
    <section className="py-16 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-pink-600" />
            <Badge className="bg-pink-100 text-pink-700 text-lg px-4 py-2">
              Limited Time Offers
            </Badge>
            <Sparkles className="h-8 w-8 text-pink-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Don't Miss Out on These Amazing Deals!
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Exclusive offers just for you. Hurry, these deals won't last long!
          </p>
        </div>

        {/* Main Countdown Banner */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl p-8 md:p-12 mb-12 text-white relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12" />
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  <Gift className="h-8 w-8" />
                  <Badge className="bg-white text-pink-600 hover:bg-gray-100">
                    Mega Sale Event
                  </Badge>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                  Up to 60% Off on Everything!
                </h3>
                <p className="text-lg mb-6 opacity-90">
                  Use code <span className="bg-white text-pink-600 px-2 py-1 rounded font-mono">FESTIVE60</span> at checkout
                </p>
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-3"
                  asChild
                >
                  <Link href="/shop">
                    Shop Now
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </div>
              
              <div className="flex-shrink-0">
                <div className="text-center">
                  <div className="flex items-center gap-2 mb-4 justify-center">
                    <Clock className="h-6 w-6" />
                    <span className="text-lg font-semibold">Offer Ends In:</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 md:gap-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 md:p-4">
                      <div className="text-2xl md:text-3xl font-bold">
                        {timeLeft.days.toString().padStart(2, '0')}
                      </div>
                      <div className="text-sm opacity-80">Days</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 md:p-4">
                      <div className="text-2xl md:text-3xl font-bold">
                        {timeLeft.hours.toString().padStart(2, '0')}
                      </div>
                      <div className="text-sm opacity-80">Hours</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 md:p-4">
                      <div className="text-2xl md:text-3xl font-bold">
                        {timeLeft.minutes.toString().padStart(2, '0')}
                      </div>
                      <div className="text-sm opacity-80">Minutes</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 md:p-4">
                      <div className="text-2xl md:text-3xl font-bold">
                        {timeLeft.seconds.toString().padStart(2, '0')}
                      </div>
                      <div className="text-sm opacity-80">Seconds</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Offer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer, index) => (
            <div
              key={index}
              className={`bg-gradient-to-r ${offer.color} rounded-2xl p-6 text-white relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-8 -mt-8" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {offer.icon}
                    <h4 className="text-xl font-bold">{offer.title}</h4>
                  </div>
                  <Badge className="bg-white text-gray-800 hover:bg-gray-100">
                    {offer.discount}
                  </Badge>
                </div>
                
                <p className="text-white opacity-90 mb-4">
                  {offer.description}
                </p>
                
                <Button 
                  variant="outline" 
                  className="bg-white bg-opacity-20 border-white text-white hover:bg-white hover:text-gray-800 w-full"
                  asChild
                >
                  <Link href="/shop">
                    Shop Collection
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Offer Details */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Terms & Conditions</h3>
            <p className="text-gray-600">Please read the following terms for all promotional offers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">What's Included:</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Free shipping on orders above ₹999
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Easy 30-day returns
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Cash on delivery available
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Quality guarantee on all products
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Important Notes:</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  Offers cannot be combined
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  Limited stock available
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  Subject to availability
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  Valid until stocks last
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
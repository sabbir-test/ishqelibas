"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Scissors, Package } from "lucide-react"
import Link from "next/link"

export default function CustomDesignPage() {

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Custom Design Studio</h1>
              <p className="text-gray-600">Choose your custom design experience</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What would you like to design?</h2>
          <p className="text-gray-600">Select your preferred custom design experience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
            <Link href="/custom-design/blouse">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                  <Scissors className="h-10 w-10 text-pink-600" />
                </div>
                <CardTitle className="text-xl mb-2">Design Your Custom Blouse</CardTitle>
                <CardDescription className="text-gray-600">
                  Create a perfectly fitted blouse with our expert tailoring and premium fabrics
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                    Premium fabric selection
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                    Front & back design options
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                    Professional measurements
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                    Perfect custom fit
                  </div>
                </div>
                <Button className="w-full bg-pink-600 hover:bg-pink-700 group-hover:bg-pink-700">
                  Start Blouse Design
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
            <Link href="/custom-design/salwar-kameez">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Package className="h-10 w-10 text-purple-600" />
                </div>
                <CardTitle className="text-xl mb-2">Design Your Salwar Kameez</CardTitle>
                <CardDescription className="text-gray-600">
                  Create an elegant salwar kameez set with traditional craftsmanship and modern style
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Exquisite fabric collection
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Traditional & modern designs
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Expert tailoring service
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Complete outfit solution
                  </div>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 group-hover:bg-purple-700">
                  Start Salwar Kameez Design
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
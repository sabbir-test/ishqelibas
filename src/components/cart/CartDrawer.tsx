"use client"

import { useCart } from "@/contexts/CartContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  X, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2,
  Heart,
  ArrowRight
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function CartDrawer() {
  const { state, removeItem, updateQuantity, clearCart, toggleCart } = useCart()

  const formatPrice = (price: number | undefined) => {
    if (typeof price !== 'number' || isNaN(price)) {
      return '₹0'
    }
    return `₹${price.toLocaleString()}`
  }

  if (!state.isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={toggleCart}
      />
      
      {/* Cart Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              <h2 className="text-lg font-semibold">Shopping Cart</h2>
              <Badge variant="secondary">{state.itemCount} items</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleCart}>
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {state.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ShoppingCart className="h-16 w-16 mb-4" />
                <p className="text-lg mb-4">Your cart is empty</p>
                <Button onClick={toggleCart} asChild>
                  <Link href="/shop">Start Shopping</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm line-clamp-2 mb-1">
                            {item.name}
                          </h3>
                          <p className="text-xs text-gray-500 mb-2">SKU: {item.sku}</p>
                          
                          {/* Size and Color */}
                          {(item.size || item.color) && (
                            <div className="mb-2">
                              {item.size && (
                                <div className="text-xs text-gray-600 mb-1">
                                  Size: <span className="font-medium">{item.size}</span>
                                </div>
                              )}
                              {item.color && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-gray-600">Color:</span>
                                  <div
                                    className="w-3 h-3 rounded-full border border-gray-300"
                                    style={{ backgroundColor: item.color }}
                                    title={item.color}
                                  />
                                  <span className="text-xs font-medium capitalize">{item.color}</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Price */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-semibold text-sm">
                              {formatPrice(item.finalPrice)}
                            </span>
                            {typeof item.price === 'number' && typeof item.finalPrice === 'number' && item.price !== item.finalPrice && (
                              <span className="text-xs text-gray-500 line-through">
                                {formatPrice(item.price)}
                              </span>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-700"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-pink-500 hover:text-pink-700"
                              >
                                <Heart className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {state.items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              {/* Clear Cart Button */}
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={clearCart}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </div>

              <Separator />

              {/* Cart Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(state.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatPrice(state.total * 0.18)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(state.total * 1.18)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  className="w-full bg-pink-600 hover:bg-pink-700"
                  onClick={toggleCart}
                  asChild
                >
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={toggleCart}
                  asChild
                >
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
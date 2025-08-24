"use client"

import React, { createContext, useContext, useReducer, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  finalPrice: number
  quantity: number
  image: string
  sku: string
  size?: string
  color?: string
  customDesign?: any // For custom blouse designs
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  isOpen: boolean
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "id"> }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }

interface CartContextType {
  state: CartState
  addItem: (item: Omit<CartItem, "id">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      // For custom design items (productId === "custom-blouse"), each item is unique
      if (action.payload.productId === "custom-blouse" && action.payload.customDesign) {
        const newItem: CartItem = {
          ...action.payload,
          id: `custom-${Date.now()}-${Math.random()}`
        }
        return calculateTotals({ ...state, items: [...state.items, newItem] })
      }
      
      // For regular products, check for existing item with same product ID, size, and color
      const existingItem = state.items.find(item => 
        item.productId === action.payload.productId &&
        item.size === action.payload.size &&
        item.color === action.payload.color
      )
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.productId === action.payload.productId &&
          item.size === action.payload.size &&
          item.color === action.payload.color
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        )
        return calculateTotals({ ...state, items: updatedItems })
      } else {
        const newItem: CartItem = {
          ...action.payload,
          id: `cart-${Date.now()}-${Math.random()}`
        }
        return calculateTotals({ ...state, items: [...state.items, newItem] })
      }
    }
    
    case "REMOVE_ITEM": {
      const filteredItems = state.items.filter(item => item.id !== action.payload)
      return calculateTotals({ ...state, items: filteredItems })
    }
    
    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        const filteredItems = state.items.filter(item => item.id !== action.payload.id)
        return calculateTotals({ ...state, items: filteredItems })
      }
      
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      )
      return calculateTotals({ ...state, items: updatedItems })
    }
    
    case "CLEAR_CART":
      return { ...state, items: [], total: 0, itemCount: 0 }
    
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen }
    
    case "LOAD_CART": {
      return calculateTotals({ ...state, items: action.payload })
    }
    
    default:
      return state
  }
}

function calculateTotals(state: CartState): CartState {
  const itemCount = state.items.reduce((sum, item) => {
    const quantity = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 1
    return sum + quantity
  }, 0)
  
  const total = state.items.reduce((sum, item) => {
    const finalPrice = typeof item.finalPrice === 'number' && !isNaN(item.finalPrice) ? item.finalPrice : 0
    const quantity = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 1
    return sum + (finalPrice * quantity)
  }, 0)
  
  return {
    ...state,
    itemCount,
    total
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
    isOpen: false
  })
  
  const { toast } = useToast()

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("ishqelibas-cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        // Validate and sanitize cart items
        const sanitizedCart = parsedCart.map((item: any) => ({
          id: item.id || `cart-${Date.now()}-${Math.random()}`,
          productId: item.productId || '',
          name: item.name || 'Unknown Product',
          price: typeof item.price === 'number' ? item.price : 0,
          finalPrice: typeof item.finalPrice === 'number' ? item.finalPrice : 0,
          quantity: typeof item.quantity === 'number' ? item.quantity : 1,
          image: item.image || '/api/placeholder/300/400',
          sku: item.sku || 'UNKNOWN-SKU',
          size: item.size || undefined,
          color: item.color || undefined,
          customDesign: item.customDesign || undefined
        }))
        dispatch({ type: "LOAD_CART", payload: sanitizedCart })
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error)
        // Clear corrupted cart data
        localStorage.removeItem("ishqelibas-cart")
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("ishqelibas-cart", JSON.stringify(state.items))
  }, [state.items])

  const addItem = (item: Omit<CartItem, "id">) => {
    dispatch({ type: "ADD_ITEM", payload: item })
    
    // Build description with customization details
    let description = `${item.name} has been added to your cart.`
    
    if (item.productId === "custom-blouse" && item.customDesign) {
      // For custom blouses, add more specific details
      const customDetails = []
      if (item.customDesign.fabric) {
        customDetails.push(`Fabric: ${item.customDesign.fabric.name}`)
      }
      if (item.customDesign.frontDesign) {
        customDetails.push(`Front Design: ${item.customDesign.frontDesign.name}`)
      }
      if (item.customDesign.backDesign) {
        customDetails.push(`Back Design: ${item.customDesign.backDesign.name}`)
      }
      if (customDetails.length > 0) {
        description += ` (${customDetails.join(', ')})`
      }
    } else if (item.size || item.color) {
      // For regular products, show size and color
      const options: string[] = []
      if (item.size) options.push(`Size: ${item.size}`)
      if (item.color) options.push(`Color: ${item.color}`)
      description += ` (${options.join(', ')})`
    }
    
    toast({
      title: "Added to cart",
      description,
    })
  }

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart.",
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    })
  }

  const toggleCart = () => {
    dispatch({ type: "TOGGLE_CART" })
  }

  return (
    <CartContext.Provider value={{
      state,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      toggleCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
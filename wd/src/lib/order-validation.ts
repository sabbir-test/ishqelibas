/**
 * Order validation utilities to filter out dummy, demo, and invalid orders
 */

export interface OrderValidationResult {
  isValid: boolean
  issues: string[]
  isDummy: boolean
  isSuspicious: boolean
}

export interface OrderWithRelations {
  id: string
  orderNumber: string
  total: number
  notes?: string | null
  orderItems?: Array<{
    product?: {
      id: string
      sku?: string | null
    } | null
  }>
  user?: {
    email: string
    isActive: boolean
  } | null
}

// Patterns to identify dummy/demo orders
const DUMMY_PATTERNS = {
  orderNumbers: [
    /^DEMO-/i,
    /^DUMMY-/i,
    /^SAMPLE-/i,
    /^ORD-(000000|111111|999999)$/i
  ],
  notes: [
    /\bdemo order\b/i,
    /\bdummy order\b/i,
    /\bsample order\b/i,
    /\bplaceholder\b/i,
    /\bfake order\b/i
  ],
  userEmails: [
    /^demo@example\./i,
    /^dummy@/i,
    /^sample@/i,
    /^fake@/i,
    /^placeholder@/i
  ],
  productSkus: [
    /^DEMO-/i,
    /^DUMMY-/i,
    /^SAMPLE-/i
  ]
}

// Validation criteria for legitimate orders
const VALIDATION_CRITERIA = {
  minOrderValue: 1,
  validPaymentMethods: ['RAZORPAY', 'COD'],
  validStatuses: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
}

/**
 * Validates if an order is legitimate (not dummy/demo)
 */
export function validateOrder(order: OrderWithRelations): OrderValidationResult {
  // Check if validation is disabled
  const validationEnabled = process.env.ORDER_VALIDATION_ENABLED !== 'false'
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  if (!validationEnabled || (isDevelopment && process.env.ORDER_VALIDATION_BYPASS === 'true')) {
    return {
      isValid: true,
      issues: [],
      isDummy: false,
      isSuspicious: false
    }
  }

  const issues: string[] = []
  let isDummy = false
  let isSuspicious = false

  // Check order number patterns
  for (const pattern of DUMMY_PATTERNS.orderNumbers) {
    if (pattern.test(order.orderNumber)) {
      issues.push(`Dummy order number pattern: ${order.orderNumber}`)
      isDummy = true
      break
    }
  }

  // Check notes for dummy patterns
  if (order.notes) {
    for (const pattern of DUMMY_PATTERNS.notes) {
      if (pattern.test(order.notes)) {
        issues.push(`Dummy notes pattern: ${order.notes}`)
        isDummy = true
        break
      }
    }
  }

  // Check user email patterns
  if (order.user?.email) {
    for (const pattern of DUMMY_PATTERNS.userEmails) {
      if (pattern.test(order.user.email)) {
        issues.push(`Dummy user email: ${order.user.email}`)
        isDummy = true
        break
      }
    }
  }

  // Check for invalid order values
  if (order.total < VALIDATION_CRITERIA.minOrderValue) {
    issues.push(`Invalid order value: ${order.total}`)
    isSuspicious = true
  }

  // Check for inactive users
  if (order.user && !order.user.isActive) {
    issues.push(`Inactive user: ${order.user.email}`)
    isSuspicious = true
  }

  // Check for orders without items
  if (!order.orderItems || order.orderItems.length === 0) {
    issues.push('Order has no items')
    isDummy = true
  }

  // Check for orders with invalid/demo products
  if (order.orderItems) {
    const invalidProducts = order.orderItems.filter(item => {
      if (!item.product) return true
      if (!item.product.sku) return false
      
      return DUMMY_PATTERNS.productSkus.some(pattern => 
        pattern.test(item.product!.sku!)
      )
    })
    
    if (invalidProducts.length > 0) {
      issues.push(`Invalid/demo products found`)
      isDummy = true
    }
  }

  const isValid = !isDummy && !isSuspicious

  return {
    isValid,
    issues,
    isDummy,
    isSuspicious
  }
}

/**
 * Filters an array of orders to exclude dummy/demo orders
 */
export function filterLegitimateOrders<T extends OrderWithRelations>(orders: T[]): T[] {
  return orders.filter(order => {
    const validation = validateOrder(order)
    return validation.isValid
  })
}

/**
 * Quick validation for order number patterns
 */
export function isValidOrderNumber(orderNumber: string): boolean {
  if (process.env.ORDER_VALIDATION_ENABLED === 'false') return true
  return !DUMMY_PATTERNS.orderNumbers.some(pattern => pattern.test(orderNumber))
}

/**
 * Quick validation for user email patterns
 */
export function isValidUserEmail(email: string): boolean {
  if (process.env.ORDER_VALIDATION_ENABLED === 'false') return true
  return !DUMMY_PATTERNS.userEmails.some(pattern => pattern.test(email))
}

/**
 * Audit orders and categorize them
 */
export function auditOrders<T extends OrderWithRelations>(orders: T[]) {
  const results = {
    legitimate: [] as T[],
    suspicious: [] as T[],
    dummy: [] as T[]
  }

  orders.forEach(order => {
    const validation = validateOrder(order)
    
    if (validation.isDummy) {
      results.dummy.push(order)
    } else if (validation.isSuspicious) {
      results.suspicious.push(order)
    } else {
      results.legitimate.push(order)
    }
  })

  return results
}
/**
 * Configuration for order validation - allows environment-specific settings
 */

export interface ValidationConfig {
  enabled: boolean
  strictMode: boolean
  allowTestOrders: boolean
  patterns: {
    orderNumbers: RegExp[]
    notes: RegExp[]
    userEmails: RegExp[]
    productSkus: RegExp[]
  }
}

// Development configuration - more lenient
const DEVELOPMENT_CONFIG: ValidationConfig = {
  enabled: true,
  strictMode: false,
  allowTestOrders: true,
  patterns: {
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
}

// Production configuration - strict filtering
const PRODUCTION_CONFIG: ValidationConfig = {
  enabled: true,
  strictMode: true,
  allowTestOrders: false,
  patterns: {
    orderNumbers: [
      /^(DEMO|TEST|DUMMY|SAMPLE)-/i,
      /^ORD-(000000|111111|999999)$/i,
      /^(TEST|DEMO)_ORDER_/i
    ],
    notes: [
      /\bdemo\b/i,
      /\btest order\b/i,
      /\bdummy\b/i,
      /\bsample\b/i,
      /\bplaceholder\b/i,
      /\bfake\b/i,
      /for testing/i,
      /for debugging/i
    ],
    userEmails: [
      /^demo@example\./i,
      /^test@example\./i,
      /^dummy@/i,
      /^sample@/i,
      /^fake@/i,
      /^placeholder@/i
    ],
    productSkus: [
      /^DEMO-/i,
      /^TEST-/i,
      /^DUMMY-/i,
      /^SAMPLE-/i
    ]
  }
}

// Disabled configuration - no filtering
const DISABLED_CONFIG: ValidationConfig = {
  enabled: false,
  strictMode: false,
  allowTestOrders: true,
  patterns: {
    orderNumbers: [],
    notes: [],
    userEmails: [],
    productSkus: []
  }
}

/**
 * Get validation configuration based on environment
 */
export function getValidationConfig(): ValidationConfig {
  const env = process.env.NODE_ENV || 'development'
  const orderValidationEnabled = process.env.ORDER_VALIDATION_ENABLED !== 'false'
  const strictMode = process.env.ORDER_VALIDATION_STRICT === 'true'
  
  if (!orderValidationEnabled) {
    return DISABLED_CONFIG
  }
  
  if (env === 'production' || strictMode) {
    return PRODUCTION_CONFIG
  }
  
  return DEVELOPMENT_CONFIG
}

/**
 * Check if validation should be bypassed for development/testing
 */
export function shouldBypassValidation(): boolean {
  return process.env.NODE_ENV === 'development' && 
         process.env.ORDER_VALIDATION_BYPASS === 'true'
}
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id

    // Get order with all related data including address
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            country: true,
            zipCode: true
          }
        },
        address: true, // Include the linked address record
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                images: true,
                description: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Generate HTML invoice
    const invoiceHtml = generateInvoiceHtml(order)

    // Return HTML response
    return new NextResponse(invoiceHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch (error) {
    console.error("Error generating invoice:", error)
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 })
  }
}

function generateInvoiceHtml(order: any) {
  // Use the linked address record for shipping, fallback to user data for billing
  const shippingAddress = order.address ? {
    name: `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim() || order.user.name || 'Customer',
    phone: order.address.phone || order.user.phone || 'N/A',
    address: order.address.address || 'N/A',
    city: order.address.city || 'N/A',
    state: order.address.state || 'N/A',
    pincode: order.address.zipCode || 'N/A',
    country: order.address.country || 'India'
  } : {
    name: order.user.name || 'Customer',
    phone: order.user.phone || 'N/A',
    address: order.user.address || 'N/A',
    city: order.user.city || 'N/A',
    state: order.user.state || 'N/A',
    pincode: order.user.zipCode || 'N/A',
    country: order.user.country || 'India'
  }

  // Use address data for billing if available, otherwise use user data
  const billingAddress = order.address ? {
    name: `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim() || order.user.name || 'Customer',
    phone: order.address.phone || order.user.phone || 'N/A',
    address: order.address.address || order.user.address || 'N/A',
    city: order.address.city || order.user.city || 'N/A',
    state: order.address.state || order.user.state || 'N/A',
    pincode: order.address.zipCode || order.user.zipCode || 'N/A',
    country: order.address.country || order.user.country || 'India'
  } : {
    name: order.user.name || 'Customer',
    phone: order.user.phone || 'N/A',
    address: order.user.address || 'N/A',
    city: order.user.city || 'N/A',
    state: order.user.state || 'N/A',
    pincode: order.user.zipCode || 'N/A',
    country: order.user.country || 'India'
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const subtotal = order.subtotal || order.total - (order.tax || 0) - (order.shipping || 0) - (order.discount || 0)
  const tax = order.tax || 0
  const shipping = order.shipping || 0
  const discount = order.discount || 0

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice #${order.orderNumber}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e5e5;
        }
        .company-info h1 {
            margin: 0;
            color: #d946ef;
            font-size: 24px;
        }
        .company-info p {
            margin: 5px 0;
            color: #666;
        }
        .invoice-info {
            text-align: right;
        }
        .invoice-info h2 {
            margin: 0;
            color: #333;
            font-size: 20px;
        }
        .invoice-info p {
            margin: 5px 0;
            color: #666;
        }
        .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        .customer-info, .shipping-info {
            flex: 1;
        }
        .customer-info {
            margin-right: 20px;
        }
        .section-title {
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
            font-size: 14px;
            text-transform: uppercase;
        }
        .info-item {
            margin-bottom: 5px;
            color: #666;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th,
        .items-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e5e5;
        }
        .items-table th {
            background-color: #f8f8f8;
            font-weight: bold;
            color: #333;
        }
        .items-table tr:hover {
            background-color: #f9f9f9;
        }
        .total-section {
            text-align: right;
            margin-bottom: 30px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        .total-row.final {
            font-weight: bold;
            font-size: 16px;
            color: #d946ef;
            border-top: 2px solid #e5e5e5;
            padding-top: 10px;
        }
        .invoice-footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
            color: #666;
            font-size: 12px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-pending {
            background-color: #fef3c7;
            color: #92400e;
        }
        .status-processing {
            background-color: #dbeafe;
            color: #1e40af;
        }
        .status-shipped {
            background-color: #d1fae5;
            color: #065f46;
        }
        .status-delivered {
            background-color: #d1fae5;
            color: #065f46;
        }
        .status-cancelled {
            background-color: #fee2e2;
            color: #991b1b;
        }
        @media print {
            body {
                background-color: white;
                padding: 0;
            }
            .invoice-container {
                box-shadow: none;
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="invoice-header">
            <div class="company-info">
                <h1>Ishq-e-Libas</h1>
                <p>Women's Fashion Boutique</p>
                <p>contact@ishqelibas.com</p>
                <p>+91 98765 43210</p>
            </div>
            <div class="invoice-info">
                <h2>INVOICE</h2>
                <p><strong>Invoice #:</strong> ${order.orderNumber}</p>
                <p><strong>Date:</strong> ${orderDate}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></p>
            </div>
        </div>

        <div class="invoice-details">
            <div class="customer-info">
                <div class="section-title">Bill To</div>
                <div class="info-item"><strong>${billingAddress.name}</strong></div>
                <div class="info-item">${order.user.email}</div>
                <div class="info-item">${billingAddress.phone}</div>
                <div class="info-item">${billingAddress.address}</div>
                <div class="info-item">${billingAddress.city}, ${billingAddress.state}</div>
                <div class="info-item">${billingAddress.pincode}</div>
                <div class="info-item">${billingAddress.country}</div>
            </div>
            <div class="shipping-info">
                <div class="section-title">Ship To</div>
                <div class="info-item"><strong>${shippingAddress.name}</strong></div>
                <div class="info-item">${shippingAddress.phone}</div>
                <div class="info-item">${shippingAddress.address}</div>
                <div class="info-item">${shippingAddress.city}, ${shippingAddress.state}</div>
                <div class="info-item">${shippingAddress.pincode}</div>
                <div class="info-item">${shippingAddress.country}</div>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>SKU</th>
                    <th>Qty</th>
                    <th>Size</th>
                    <th>Color</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.orderItems.map((item: any, index: number) => {
                  // Enhanced product name with design details for custom products
                  let productName = item.product?.name || 'Custom Product'
                  let productDetails = ''
                  
                  if (item.productId === 'custom-blouse') {
                    productName = 'Custom Blouse Design'
                    productDetails = `
                      <div class="text-sm text-gray-600 mt-1">
                        <div>Custom blouse with selected fabric and design</div>
                        <div>Tailored to customer measurements</div>
                      </div>
                    `
                  } else if (item.productId === 'custom-salwar-kameez') {
                    productName = 'Custom Salwar Kameez Design'
                    productDetails = `
                      <div class="text-sm text-gray-600 mt-1">
                        <div>Custom salwar kameez with selected design</div>
                        <div>Tailored to customer measurements</div>
                      </div>
                    `
                  } else if (item.product?.description) {
                    productDetails = `<div class="text-sm text-gray-600 mt-1">${item.product.description}</div>`
                  }
                  
                  return `
                    <tr>
                        <td>
                          <div class="font-medium">${productName}</div>
                          ${productDetails}
                        </td>
                        <td class="text-sm">${item.product?.sku || 'CUSTOM'}</td>
                        <td>${item.quantity}</td>
                        <td>${item.size || 'Custom'}</td>
                        <td>${item.color || 'As Selected'}</td>
                        <td>₹${item.price.toFixed(2)}</td>
                        <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  `
                }).join('')}
            </tbody>
        </table>

        <div class="total-section">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>₹${subtotal.toFixed(2)}</span>
            </div>
            ${tax > 0 ? `
            <div class="total-row">
                <span>Tax:</span>
                <span>₹${tax.toFixed(2)}</span>
            </div>
            ` : ''}
            ${shipping > 0 ? `
            <div class="total-row">
                <span>Shipping:</span>
                <span>₹${shipping.toFixed(2)}</span>
            </div>
            ` : ''}
            ${discount > 0 ? `
            <div class="total-row">
                <span>Discount:</span>
                <span>-₹${discount.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="total-row final">
                <span>Total Amount:</span>
                <span>₹${order.total.toFixed(2)}</span>
            </div>
        </div>

        <div class="invoice-footer">
            <p>Thank you for your business! For any questions regarding this invoice, please contact us at contact@ishqelibas.com</p>
            <p>Ishq-e-Libas - Exquisite Women's Fashion Collection</p>
        </div>
    </div>
</body>
</html>
  `
}
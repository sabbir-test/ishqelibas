import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id

    // Get order with all related data
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
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                images: true
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
  const shippingAddress = JSON.parse(order.shippingAddress || '{}')
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
                <div class="info-item"><strong>${order.user.name || 'Customer'}</strong></div>
                <div class="info-item">${order.user.email}</div>
                <div class="info-item">${order.user.phone || 'N/A'}</div>
                <div class="info-item">${order.user.address || 'N/A'}</div>
                <div class="info-item">${order.user.city || 'N/A'}, ${order.user.state || 'N/A'}</div>
                <div class="info-item">${order.user.zipCode || 'N/A'}</div>
            </div>
            <div class="shipping-info">
                <div class="section-title">Ship To</div>
                <div class="info-item"><strong>${shippingAddress.name || order.user.name || 'Customer'}</strong></div>
                <div class="info-item">${shippingAddress.phone || order.user.phone || 'N/A'}</div>
                <div class="info-item">${shippingAddress.address || 'N/A'}</div>
                <div class="info-item">${shippingAddress.city || 'N/A'}, ${shippingAddress.state || 'N/A'}</div>
                <div class="info-item">${shippingAddress.pincode || 'N/A'}</div>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Size</th>
                    <th>Color</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.orderItems.map((item: any) => `
                    <tr>
                        <td>${item.product?.name || 'Custom Product'}</td>
                        <td>${item.quantity}</td>
                        <td>${item.size || 'N/A'}</td>
                        <td>${item.color || 'N/A'}</td>
                        <td>₹${item.price.toFixed(2)}</td>
                        <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                `).join('')}
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
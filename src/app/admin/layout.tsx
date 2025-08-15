import { redirect } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // In a real app, you would check authentication and admin role here
  // For now, we'll just render the children
  return (
    <div className="min-h-screen bg-gray-100">
      {children}
    </div>
  )
}
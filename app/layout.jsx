import './globals.css'

export const metadata = {
  title: 'Auto Responder App',
  description: 'Admin and Client Dashboard for Auto-Responder System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800">{children}</body>
    </html>
  )
}

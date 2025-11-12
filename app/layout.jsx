import './globals.css'

export const metadata = {
  title: 'Auto Responder App',
  description: 'Automated replies for clients',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  )
}

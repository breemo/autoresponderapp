export const metadata = {
  title: 'Auto Responder App',
  description: 'Automation dashboard for responders',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

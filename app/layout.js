export const metadata = {
  title: 'Auto Responder',
  description: 'Automation dashboard'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}

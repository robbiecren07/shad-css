import { Roboto, Raleway } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './globals.scss'

const roboto = Roboto({
  variable: '--font-body',
})
const raleway = Raleway({
  variable: '--font-heading',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${raleway.variable}`}>
        <div className="app">
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  )
}

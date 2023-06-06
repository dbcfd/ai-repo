"use client"

import * as React from 'react'
import './globals.css'
import { Inter } from 'next/font/google'
import { Login } from "@/components"
import Wallet from 'ethereumjs-wallet'

import { WalletContext } from '@/utils'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
  }) {
  const [wallet, setWallet] = React.useState(null as Wallet | null)
  return (
    <html lang="en">
      <WalletContext.Provider value={{ wallet }}>
        <body className={inter.className}>
          <nav className="flex justify-end">
            <Login setWallet={setWallet} />
          </nav>
          {children}
        </body>
      </WalletContext.Provider>
    </html>
  )
}

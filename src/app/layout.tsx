"use client"

import * as React from 'react'
import Link from 'next/link'
import { Inter } from 'next/font/google'
import { Login } from "@/components"
import Wallet from 'ethereumjs-wallet'

import { WalletContext } from '@/utils'

import './globals.css'
import { AuthContext } from '@/features/auth'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
  }) {
  return (
    <html lang="en">
      <AuthContext.Provider value={{}} >
        <body className={inter.className}>
          <nav className="flex justify-between items-center w-full">
            <div className='flex items-center'>
              <Link href='/'>
                <h1 className='uppercase font-bold text-xl mr-24'>ai.repo</h1>
              </Link>
              <Link href='/finetune'>
                <p className='uppercase text-md mr-4'>finetune</p>
              </Link>
              <Link href='/model'>
                <p className='uppercase text-md mr-4'>model</p>
              </Link>
            </div>
            <Login />
          </nav>
          {children}
        </body>
      </AuthContext.Provider>
    </html>
  )
}

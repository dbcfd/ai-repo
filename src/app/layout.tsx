"use client"

import * as React from 'react'
import Link from 'next/link'
import { Inter } from 'next/font/google'
import { Login } from "@/components"

import { AuthProvider } from '../features/auth'
import { ComposeDB } from '@/features/composedb';

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// What this value?
const GQL_URL = ''

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <ComposeDB>
        <AuthProvider>
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
        </AuthProvider>
      </ComposeDB>
    </html>
  )
}

"use client"

import * as React from 'react'
import Link from 'next/link'
import { Inter } from 'next/font/google'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { Login } from "@/components"

import { AuthProvider } from '../features/auth'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// What this value?
const GQL_URL = ''

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const client = new ApolloClient({
    uri: GQL_URL,
    cache: new InMemoryCache()
  });
  return (
    <html lang="en">
      <ApolloProvider client={client}>
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
      </ApolloProvider>
    </html>
  )
}

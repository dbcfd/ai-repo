"use client"

import React from 'react'
import { useLogin } from '@/utils'

export function Login() {
  const login = useLogin()

  async function onClick() {
    const key = await login()
    // save this off in store locally to use through app
    console.log(key)
  }

  return (
    <button className='bg-blue-purple hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full' onClick={onClick}>
      Connect
    </button>
  )
}
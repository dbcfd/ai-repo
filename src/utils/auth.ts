import * as React from 'react'
import * as eth from '@polybase/eth'
import { Polybase } from '@polybase/client'
import Wallet from 'ethereumjs-wallet'

export interface Account {
  id: string; 
  name?: string;
  pvkey: string;
  apikey: string;
}

export interface WalletContextI {
  wallet: Wallet | null
}

export const WalletContext = React.createContext<WalletContextI>({
  wallet: null
})

async function getWallet(account: string, db: Polybase) {
  const col = db.collection<Account>('User')
  const doc = col.record(account)
  const user = await doc.get().catch(() => null)
  if (!user || !user.data) {
    const wallet = Wallet.generate()
    const privateKeyBuff = wallet.getPrivateKey()
    const privateKey = privateKeyBuff.toString('hex')

    const encryptedPrivateKey = await eth.encrypt(privateKey, account)

    db.signer(async (data: string) => {
      return { h: 'eth-personal-sign', sig: eth.ethPersonalSign(wallet.getPrivateKey(), data) }
    })

    const API_KEY = '' // later set by user

    await col.create([account, encryptedPrivateKey, API_KEY, '']).catch((e) => {
      console.error(e)
      throw e
    })

    return wallet
  } else {
    const privateKey = await eth.decrypt(user.data.pvkey, account)
    return Wallet.fromPrivateKey(Buffer.from(privateKey, 'hex'))
  }
}

export function useLogin() {
  const db = new Polybase({
    defaultNamespace: process.env.NEXT_PUBLIC_POLYBASE_DEFAULT_NAMESPACE,
  })

  return async () => {
    const accounts = await eth.requestAccounts()
    const account = accounts[0]
    const wallet = await getWallet(account, db)

    // Update the signer
    db.signer(async (data: string) => {
      return { h: 'eth-personal-sign', sig: eth.ethPersonalSign(wallet.getPrivateKey(), data) }
    })

    return wallet
  }
}
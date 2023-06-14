import * as React from 'react'
import * as eth from '@polybase/eth'
import { Polybase } from '@polybase/client'
import Wallet from 'ethereumjs-wallet'

export interface Account {
  id: string; 
  name?: string;
  publicKey: string;
  apiKey: string;
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

    db.signer(async (data: string) => {
      return { h: 'eth-personal-sign', sig: eth.ethPersonalSign(wallet.getPrivateKey(), data) }
    })

    //apiKey and name set later by the user
    const apiKey = '';
    await col.create([account, apiKey]).catch((e) => {
      console.error(e)
      throw e
    })

    return wallet
  } else {
    // TODO: this needs to be changed since we're not storing the private key
    // in practice, this can all be deleted in favor of features/auth
    const privateKey = await eth.decrypt(user.data.apiKey, account)
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
import * as eth from '@polybase/eth'
import { usePolybase } from '@polybase/react'
import { Polybase } from '@polybase/client'
import Wallet from 'ethereumjs-wallet'

const USERS_ROUTE = 'pk/0xbf16eba29b3d8eaa4b7c5a07f79dd58c0cd1d3931cb7f3addf632dc3170228f99d62e3407ccbf1d44655170ed2bde6e626b184aea138d1ce481c239673e407bf/user'

export interface Account {
  id: string; 
  name?: string;
  pvkey: string;
  $pk: string;
  apikey: string;
}

async function getWallet(account: string, db: Polybase) {
  const col = db.collection<Account>(USERS_ROUTE)
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

    const API_KEY = '' // get fromn env

    await col.create([account, encryptedPrivateKey, API_KEY]).catch((e) => {
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
  const db = usePolybase()

  return async () => {
    const accounts = await eth.requestAccounts()
    const account = accounts[0]
    const wallet = await getWallet(account, db)

    // Update the signer
    db.signer(async (data: string) => {
      return { h: 'eth-personal-sign', sig: eth.ethPersonalSign(wallet.getPrivateKey(), data) }
    })
  }
}
'use client'

import React from 'react'
import Wallet from 'ethereumjs-wallet'
import { useSpring, animated } from 'react-spring'
import { usePolybase } from '@polybase/react'
import { XCircleIcon } from '@heroicons/react/24/solid'

import { Account, truncateString } from '@/utils'
import { AuthContext, getEthereumAddress } from '@/features/auth'

interface LoginProps {
}

export function Login({
}: LoginProps
) {
  const [isPanelOpen, setPanelOpen] = React.useState(false)
  const [sidePanel, setSidePanel] = React.useState<HTMLElement | null>(null)
  const { loading, auth, login, logout } = React.useContext(AuthContext)
  const db = usePolybase()


  const [windowWidth, setWindowWidth] = React.useState(1000);
  const [ethAddr, setEthAddr] = React.useState<string | null>(null);

  const getAddr = React.useEffect(() => {
    async function getAddress() {
      if (auth?.signer) {
        const addr = await getEthereumAddress(auth)
        if (addr) {
          setEthAddr(truncateString(addr, 6))
        } else {
          setEthAddr(null)
        }
      }
    }
    getAddress()
  }, [auth?.signer]);

  React.useEffect(() => {
    if (window) {
      setWindowWidth(window.innerWidth)
    }
  }, []);

  const sidePanelProps = useSpring({
    config: {
      mass: 1,
      friction: 20,
      tension: 210,
    },
    left: isPanelOpen ? windowWidth - 350 : windowWidth
  })

  async function onClick() {
    await login()
  }

  async function submitKey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.target as HTMLFormElement)
    const { openApiKey } = Object.fromEntries(formData) as any

    const col = db.collection<Account>(`${process.env.NEXT_PUBLIC_POLYBASE_DEFAULT_NAMESPACE}/User`)
    const doc = col.record(await auth?.signer.getAddress()!)
    const user = await doc.get().catch(() => null)

    if (user) {
      const res = await user.call('setAPIKey', [openApiKey])

      if (res) {
        // TODO: success popper
      }
    }
  }

  if (ethAddr) {

    return (
      <>
        <button className='bg-blue-purple hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full' onClick={() => setPanelOpen(true)}>
          {ethAddr}
        </button>
        <animated.div
          ref={setSidePanel}
          className='absolute top-0 w-[350px] h-full bg-slate-200 border-slate-300 border-l-[1px] px-2 py-4'
          style={sidePanelProps}>
          {isPanelOpen && (
            <div className='w-full h-full flex flex-col justify-between'>
              <div>
                <div className='flex justify-between items-center'>
                  <h3 className='text-lg text-ellipsis overflow-hidden font-bold'>
                    {ethAddr}
                  </h3>
                  <button className='flex items-center justify-center text-xs uppercase h-[26px]' onClick={() => setPanelOpen(false)}>
                    <XCircleIcon height={24} />
                  </button>
                </div>
                <form onSubmit={submitKey} className='flex flex-col mt-12'>
                  <label htmlFor='openApiKey' className='mb-2 text-xs text-s-white-1 uppercase font-bold'>OpenApi Key</label>
                  <input name='openApiKey' className='rounded p-2 mb-2 text-black' />

                  <button type='submit' className='bg-blue-purple-light text-white py-2.5 px-4 mt-4 uppercase rounded flex items-center justify-center'>
                    Add API Key
                  </button>
                </form>
              </div>
            </div>
          )}
        </animated.div>
      </>
    )
  }

  return (
    <button className='bg-blue-purple hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full' onClick={onClick}>
      Connect
    </button>
  )
}

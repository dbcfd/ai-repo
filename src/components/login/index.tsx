'use client'

import React, {ReactElement} from 'react'
import { useSpring, animated, a } from 'react-spring'
import { User, truncateString } from '@/utils'
import { XCircleIcon } from '@heroicons/react/24/solid'
import { AuthContext } from '@/features/auth'

interface LoginProps {
}

export function Login({}: LoginProps) {
  const [isPanelOpen, setPanelOpen] = React.useState(false)
  const [sidePanel, setSidePanel] = React.useState<HTMLElement | null>(null)
  const { auth, login } = React.useContext(AuthContext)

  const [windowWidth, setWindowWidth] = React.useState(1000);
  const [ethAddrAbbrv, setEthAddrAbbrv] = React.useState<string | null>(null);
  const [ensAddr, setEnsAddr] = React.useState<string | null>(null);

  React.useEffect(() => {
    const addr = auth?.ethereumAddress
    if (addr) {
      setEthAddrAbbrv(truncateString(addr, 6))
    } else {
      setEthAddrAbbrv(null)
    }
  }, [auth?.ethereumAddress]);

  React.useEffect(() => {
    async function getEnsAddress() {
      if (auth?.ethereumAddress) {
        try {

          const addr = await auth.provider.lookupAddress(auth.ethereumAddress)

          if (addr) {
            setEnsAddr(addr)
          } else {
            setEnsAddr(null)
          }
        }
        catch (ex) {
          console.log(`Can't lookup ENS address`, ex)
        }
      }
    }
    getEnsAddress()
  }, [auth]);

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
    const { openAiKey } = Object.fromEntries(formData) as any

    if (ethAddrAbbrv) {
      const col = auth!.db.collection<User>('User')
      const result = await col.record(auth!.ethereumAddress).get().catch(() => null)
      const user = result?.data
      if (user) {
        // try {
        //   const res = await col
        //       .record(auth!.ethereumAddress)
        //       .call('setAPIKey', [openAiKey])
        //   if (res) {
        //     // TODO: success popper
        //     console.log('set api key')
        //   }
        // } catch (ex) {
        //   throw new Error(`Failed to call polybase setApiKey: ${ex}`)
        // }
      }
    }
  }

  if (ethAddrAbbrv) {
    return (
      <>
        <button className='bg-blue-purple hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full' onClick={() => setPanelOpen(true)}>
          {ensAddr ? ensAddr : ethAddrAbbrv}
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
                    {ensAddr ? ensAddr : ethAddrAbbrv}
                  </h3>
                  <button className='flex items-center justify-center text-xs uppercase h-[26px]' onClick={() => setPanelOpen(false)}>
                    <XCircleIcon height={24} />
                  </button>
                </div>
                <form onSubmit={submitKey} className='flex flex-col mt-12'>
                  <label htmlFor='openAiKey' className='mb-2 text-xs text-s-white-1 uppercase font-bold'>OpenAI API Key</label>
                  <input name='openAiKey' className='rounded p-2 mb-2 text-black' />

                  <button type='submit' className='bg-blue-purple-light text-white py-2.5 px-4 mt-4 uppercase rounded flex items-center justify-center'>
                    Add OpenAI API Key
                  </button>
                </form>
              </div>
            </div>
          )}
        </animated.div>
      </>
    )
  }

  return <div>
      <button className='bg-blue-purple hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full' onClick={onClick}>
        Connect
      </button>
  </div>
}

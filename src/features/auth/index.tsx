import { useState, useEffect, useCallback, useMemo, createContext, ReactNode } from 'react'
import { EthereumWebAuth, getAccountId } from '@didtools/pkh-ethereum'
import { DIDSession } from 'did-session'
import { BrowserProvider, Eip1193Provider, ethers, JsonRpcSigner } from 'ethers'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { ComposeClient } from '@composedb/client'
import * as definition from '../../../generated/runtime.json'
import { RuntimeCompositeDefinition } from '@composedb/types'
import { CollectionRecordResponse, Polybase } from '@polybase/client'
import { User } from '@/utils'

type AuthenticatedSession = {
    signer: JsonRpcSigner
    provider: BrowserProvider
    eth: Eip1193Provider
    didSession: DIDSession
    ceramic: CeramicClient
    composedb: ComposeClient
    db: Polybase
    apiKey?: string
    polybaseUser: CollectionRecordResponse<User | null>
    ethereumAddress: string
}


type LoginFn = () => Promise<void>
type LogoutFn = () => Promise<void>

type AuthenticationMemo = {
    auth: AuthenticatedSession | null
    loading: boolean
    login: LoginFn
    logout: LogoutFn
}

const CERAMIC_AUTH = 'ceramic:auth'

declare global {
    interface Window {
        ethereum: any;
    }
}

async function authenticateSession(): Promise<AuthenticatedSession | null> {
    const url = process.env.NEXT_PUBLIC_CERAMIC_URL
    if (!url) {
        throw Error('Missing ceramic URL configuration')
    }

    const db = new Polybase({
        defaultNamespace: process.env.NEXT_PUBLIC_POLYBASE_DEFAULT_NAMESPACE,
    })

    const ceramic = new CeramicClient(url);

    const composedb = new ComposeClient({
        ceramic: url,
        // cast our definition as a RuntimeCompositeDefinition
        definition: definition as RuntimeCompositeDefinition,
    });

    const { ethereum } = window

    if (!ethereum?.isMetaMask) {
        throw new Error('Install metamask')
    }

    const provider = new ethers.BrowserProvider(ethereum)
    if (!provider) {
        throw new Error('Missing ethereum provider')
    }
    const signer = await provider.getSigner()
    if (!signer) {
        throw new Error('Missing signer')
    }
    // const accountId = await getAccountId(signer.provider, signer.address)
    const accountId = await getAccountId(ethereum, signer.address)
    if (!accountId) {
        throw new Error('Missing account ID')
    }

    const authMethod = await EthereumWebAuth.getAuthMethod(ethereum, accountId)
    if (!authMethod) {
        throw new Error('Missing authMethod')
    }
    const didSession = await DIDSession.authorize(authMethod, { resources: composedb.resources })
    if (!didSession) {
        throw new Error('Missing didSession')
    }
    localStorage.setItem(CERAMIC_AUTH, didSession.serialize());

    db.signer(async (data: string) => {
        return { h: 'eth-personal-sign', sig: await signer.signMessage(data) }
    })

    const col = db.collection<User>('User')
    const doc = col.record(accountId.address)
    let created = await doc.get().catch(() => null)
    if (!created || !created.data) {
        created = await col.create([accountId.address, '']).catch((e) => {
            console.error(e)
            throw e
        })
    }
    if (!created.data) {
        throw new Error('Failed to create user')
    }

    const ethereumAddress = await signer.getAddress()

    return {
        ceramic,
        composedb,
        eth: ethereum,
        provider,
        db,
        didSession,
        signer,
        ethereumAddress,
        polybaseUser: created
    }
}

export const AuthContext = createContext<AuthenticationMemo>({
    loading: true,
    auth: null,
    login: async () => { },
    logout: async () => { },
})

export function AuthProvider({ children }: { children: ReactNode }) {
    const [auth, setAuth] = useState<AuthenticatedSession | null>(null)
    const [loading, setLoading] = useState(true)

    const login = useCallback(async () => {
        const completedAuth = await authenticateSession()
        setAuth(completedAuth)
    }, [])


    const logout = useCallback(async () => {
        setAuth(null)
    }, [])

    useEffect(() => {
        // const userId = Cookies.get(userIdPath)
        setLoading(false)
        // if (userId) setAuth({ userId })
    }, [])

    const value = useMemo(() => ({
        auth,
        loading,
        login,
        logout,
    }), [auth, loading, login, logout])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}


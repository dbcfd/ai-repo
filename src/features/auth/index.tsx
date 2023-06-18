import {useState, useEffect, useCallback, useMemo, createContext, ReactNode} from 'react'
import { EthereumWebAuth, getAccountId } from '@didtools/pkh-ethereum'
import { DIDSession } from 'did-session'
import { BrowserProvider, Eip1193Provider, ethers, JsonRpcSigner } from 'ethers'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { ComposeClient } from '@composedb/client'
import * as definition from '../../../generated/runtime.json'
import { RuntimeCompositeDefinition } from '@composedb/types'
import { CollectionRecordResponse, Polybase } from '@polybase/client'
import { User } from '@/utils'
require('dotenv').config()

export type Api = {
    ceramic: CeramicClient
    composedb: ComposeClient
    openAIKey: string
    db: Polybase
}

export type UserInfo = {
    signer: JsonRpcSigner
    provider: BrowserProvider
    eth: Eip1193Provider
    didSession: DIDSession
    polybaseUser: CollectionRecordResponse<User | null>
    ethereumAddress: string
}

export type AuthenticatedSession = {
    api: Api
    user?: UserInfo
}


type LoginFn = () => Promise<void>
type LogoutFn = () => Promise<void>

type AuthenticationMemo = {
    api: Api
    user?: UserInfo
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

async function authenticateSession(api: Api): Promise<UserInfo> {
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

    const didSession = await DIDSession.authorize(authMethod, { resources: api.composedb.resources })
    if (!didSession) {
        throw new Error('Missing didSession')
    }
    console.log('Setting DID for composedb')
    api.composedb.setDID(didSession.did)
    localStorage.setItem(CERAMIC_AUTH, didSession.serialize());

    api.db.signer(async (data: string) => {
        return { h: 'eth-personal-sign', sig: await signer.signMessage(data) }
    })

    const col = api.db.collection<User>('User')
    const doc = col.record(accountId.address)
    let created = await doc.get().catch(() => null)
    if (!created || !created.data) {
        console.log(`No existing user for address ${accountId.address}`)
        created = await col.create([accountId.address, '']).catch((e) => {
            console.error(e)
            throw e
        })
    }
    if (!created.data) {
        throw new Error('Failed to create user')
    }

    //const ethereumAddress = await signer.getAddress()
    const ethereumAddress = accountId.address

    return {
        eth: ethereum,
        provider,
        didSession,
        signer,
        ethereumAddress,
        polybaseUser: created,
    }
}

function defaultApi(): Api {
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

    const openAIKey = process.env.NEXT_PUBLIC_OPENAI_KEY
    if (!openAIKey) {
        throw Error('Missing OpenAI Key')
    }

    return {
        ceramic,
        composedb,
        db,
        openAIKey
    }
}

export const AuthContext = createContext<AuthenticationMemo>({
    loading: true,
    api: defaultApi(),
    login: async () => { },
    logout: async () => { },
})

export function AuthProvider({ children }: { children: ReactNode }) {
    const api = defaultApi()

    const [user, setUser] = useState<UserInfo | undefined>(undefined)
    const [loading, setLoading] = useState(false)

    const login = useCallback(async () => {
        if(!user && !loading) {
            console.log('Authenticating')
            setLoading(true)
            const userInfo = await authenticateSession(api)
            setUser(userInfo)
            console.log('Authentication complete')
        }
    }, [api, user, loading])


    const logout = useCallback(async () => {
        console.log('Logout')
        setUser(undefined)
    }, [])

    useEffect(() => {
        console.log('Marking login as complete')
        setLoading(false)
    }, [])

    const value = useMemo(() => ({
        api,
        user,
        loading,
        login,
        logout,
    }), [api, user, loading, login, logout])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}


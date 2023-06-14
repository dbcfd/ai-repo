import { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react'
import { EthereumWebAuth, getAccountId } from '@didtools/pkh-ethereum'
import { AccountId } from 'caip'
import { DIDSession } from 'did-session'
import { ethers, JsonRpcSigner } from 'ethers'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { ComposeClient } from '@composedb/client'
import * as definition from '../../../generated/runtime.json'
import { RuntimeCompositeDefinition } from '@composedb/types'
import { Polybase } from '@polybase/client'
import { Account } from '@/utils'

type AuthenticatedSession = {
    signer: JsonRpcSigner
    didSession: DIDSession
    ceramic: CeramicClient
    composedb: ComposeClient
    db: Polybase
}

type LoginFn = (sess: AuthenticatedSession) => Promise<void>
type LogoutFn = () => Promise<void>

type AuthenticationMemo = {
    auth: AuthenticatedSession | null
    loading: boolean
    login: LoginFn
    logout: LogoutFn
}

const CERAMIC_AUTH = 'ceramic:auth'

// async function getAccountId(ethProvider: any, address: any) {
//     const ethChainId = await ethProvider.send('eth_chainId', []);
//     const chainId = `eip155:${ethChainId}`;
//     return new AccountId({
//         address,
//         chainId
//     });
// }

async function authenticateSession(func: LoginFn): Promise<void> {
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

    console.log('eth ', ethereum)

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
        throw new Error('Missing authMethod')
    }
    localStorage.setItem(CERAMIC_AUTH, didSession.serialize());

    db.signer(async (data: string) => {
        return { h: 'eth-personal-sign', sig: await signer.signMessage(data) }
    })

    const col = db.collection<Account>('User')
    const doc = col.record(accountId.address)
    const user = await doc.get().catch(() => null)
    if (!user || !user.data) {
        await col.create([accountId.address, '']).catch((e) => {
            console.error(e)
            throw e
        })
    }

    const auth = {
        ceramic,
        composedb,
        db,
        didSession,
        signer
    }
    func(auth)
}

export const AuthContext = createContext<AuthenticationMemo>({
    loading: true,
    auth: null,
    login: async () => { },
    logout: async () => { },
})

export default function Auth({ children }) {
    const [auth, setAuth] = useState<AuthenticationMemo['auth']>(null)
    const [loading, setLoading] = useState(true)

    const login = useCallback(async (completedAuth: AuthenticatedSession) => {
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

export function useAuth() {
    const authContext = useContext(AuthContext)
    if (!authContext)
        throw new Error('useAuth must be called within a AuthContext.Provider tag');
    return useContext(AuthContext);
}

export function useIsLoggedIn() {
    const { auth, loading } = useAuth()
    return [!!auth, loading]
}

export function useLogin() {
    const { login } = useAuth()

    return authenticateSession(login)
}

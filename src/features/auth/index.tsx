import {useState, useEffect, useCallback, useMemo, createContext, useContext} from 'react'
import {EthereumWebAuth, getAccountId} from '@didtools/pkh-ethereum'
import {DIDSession} from 'did-session'
import {ethers, JsonRpcSigner} from 'ethers'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { ComposeClient } from '@composedb/client'
import * as definition from '../../../generated/runtime.json'
import {RuntimeCompositeDefinition} from '@composedb/types'
import {Polybase} from "@polybase/client'

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
    auth: AuthenticatedSession
    loading: boolean
    login: LoginFn
    logout: LogoutFn
}

const CERAMIC_AUTH = 'ceramic:auth'

async function authenticateSession(func: LoginFn): Promise<void> {
    const url = process.env.CERAMIC_URL

    const db = new Polybase({
        defaultNamespace: process.env.NEXT_PUBLIC_POLYBASE_DEFAULT_NAMESPACE,
    })

    const ceramic = new CeramicClient(url);

    const composedb = new ComposeClient({
        ceramic: url,
        // cast our definition as a RuntimeCompositeDefinition
        definition: definition as RuntimeCompositeDefinition,
    });

    const { ethereum } = window;
    if (!ethereum.isMetaMask) {
        throw new Error('Install metamask')
    }

    const provider = new ethers.BrowserProvider(ethereum)
    const signer = await provider.getSigner()
    const accountId = await getAccountId(provider, signer.address)
    const authMethod = await EthereumWebAuth.getAuthMethod(provider, accountId)
    const didSession = await DIDSession.authorize(authMethod, {resources: composedb.resources})
    localStorage.setItem(CERAMIC_AUTH, didSession.serialize());

    db.signer(async (data: string) => {
        return {h: 'eth-personal-sign', sig: await signer.signMessage(data)}
    })

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

export default function Auth({children}) {
    const [auth, setAuth] = useState<AuthenticationMemo['auth']>(null)
    const [loading, setLoading] = useState(true)

    const login = useCallback(async (completedAuth) => {
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
    return useContext(AuthContext)
}

export function useIsLoggedIn() {
    const { auth, loading } = useAuth()
    return [!!auth, loading]
}

export function useLogin() {
    const { login } = useAuth()

    return authenticateSession(login)
}
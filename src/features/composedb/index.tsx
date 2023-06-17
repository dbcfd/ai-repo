import {createContext, ReactNode, useContext, useMemo} from "react";
import { AuthContext } from "../auth";
import { ApolloClient, ApolloLink, InMemoryCache, NormalizedCacheObject, Observable } from "@apollo/client";
import { DID } from "dids";

type ComposeDBMemo = {
    did: DID
    client: ApolloClient<NormalizedCacheObject>
}

export const ComposeDBContext = createContext<ComposeDBMemo | null>(null)

export function ComposeDB({ children }: { children: ReactNode }) {
    const auth = useContext(AuthContext).auth

    const value = useMemo(() => {
        if(!auth) {
            return null
        }
        const link = new ApolloLink((operation) => {
            return new Observable((observer) => {
                auth.composedb.execute(operation.query, operation.variables).then(
                    (result) => {
                        observer.next(result)
                        observer.complete()
                    },
                    (error) => {
                        observer.error(error)
                    }
                )
            })
        })

        const did = auth.didSession.did
        const client = new ApolloClient({ cache: new InMemoryCache(), link })
        return ({
            did,
            client
        })
    }, [auth])

    function renderWithContext(value: ComposeDBMemo | null) {
        if(!value) {
            return <div>ComposeDB can only be used in an authenticated context</div>
        }
        return children
    }

    return (
        <ComposeDBContext.Provider value={value}>
            {renderWithContext(value)}
        </ComposeDBContext.Provider>
    )
}
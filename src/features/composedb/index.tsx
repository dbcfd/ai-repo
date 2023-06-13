import {createContext, useContext, useMemo} from "react";
import {AuthContext} from "../auth";
import {ApolloClient, ApolloLink, InMemoryCache, NormalizedCacheObject, Observable} from "@apollo/client";
import {DID} from "dids";

type ComposeDBMemo = {
    did: DID
    client: ApolloClient<NormalizedCacheObject>
}

export const ComposeDBContext = createContext<ComposeDBMemo>(null)

export function ComposeDB({children}) {
    const auth = useContext(AuthContext).auth

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
    const value = useMemo(() => ({
        did,
        client
    }), [client])

    return (
        <ComposeDBContext.Provider value={value}>
            {children}
        </ComposeDBContext.Provider>
    )
}
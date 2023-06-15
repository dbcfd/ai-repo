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


    const value = useMemo(() => {
        if (!auth) {
            return <div>ComposeDB can only be used in an authenticated context</div>
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

    return (
        <ComposeDBContext.Provider value={value}>
            {children}
        </ComposeDBContext.Provider>
    )
}
import { Collection, CollectionList, PolybaseError, Query } from "@polybase/client"
import { useEffect, useState } from "react"

export interface UseCollectionReturnValue<T> {
    error: PolybaseError | null
    data: CollectionList<T> | null
    loading: boolean
}

export function useCollection<T = any>(collection?: Collection<T> | Query<T> | null): UseCollectionReturnValue<T> {
    const [res, setResult] = useState<UseCollectionReturnValue<T>>({ error: null, data: null, loading: true })
    const key = collection?.key()

    useEffect(() => {
        if (!collection) return
        setResult((res) => ({ ...res, loading: true }))
        const unsub = collection.onSnapshot((data) => {
            setResult({ data, error: null, loading: false })
        }, (err) => {
            setResult((res) => ({ data: res.data, error: err, loading: false }))
        })
        return unsub
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key])

    return res
}

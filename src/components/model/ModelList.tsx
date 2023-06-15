"use client"

import React, { useState } from 'react'
import { AIModelCommits, Collections } from '../../utils/types'
import { useParams } from "next/navigation";
import { AuthContext } from '@/features/auth'
import { CollectionRecordResponse } from '@polybase/client';
import { Model } from './Model';

export function ModelList() {

    const [commits, setCommits] = useState<CollectionRecordResponse<AIModelCommits, AIModelCommits>[] | null>(null)
    const { account } = useParams()
    const { auth, } = React.useContext(AuthContext)

    React.useEffect(() => {
        async function getModels() {
            if (auth) {

                const col = auth.db.collection<AIModelCommits>(Collections.AIModelCommits)
                const commits = await col.where('owner', '==', auth.ethereumAddress).sort('version.major', 'desc').get().catch(() => null)
                if (commits) {
                    const { data, cursor } = commits
                    setCommits(data)
                }
            }
        }
        getModels()
    }, [auth]);

    if (!auth?.ethereumAddress) {
        return (<>
            <div className='w-full h-full flex flex-col justify-between'>
                {'Connect your metamask account'}
            </div></>
        )
    }

    return (
        <>
            <div className='w-full h-full flex flex-col justify-between'>
                {commits?.map(d => <Model data={d.data} />) || 'No AI model commits'}
            </div>
        </>
    )
}
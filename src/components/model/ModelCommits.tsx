"use client"

import React, { useState } from 'react'
import { AIModelCommits, Collections } from '@/utils'
// import { useParams } from "next/navigation";
import { AuthContext } from '@/features/auth'
import { CollectionRecordResponse } from '@polybase/client';
import { Model } from './Model';

export function ModelCommits({link}: {link?: string}) {
    const [commits, setCommits] = useState<CollectionRecordResponse<AIModelCommits, AIModelCommits>[] | null>(null)
    // const { account } = useParams()
    const { auth, } = React.useContext(AuthContext)

    React.useEffect(() => {
        async function getModels() {
            if (auth.user && link) {
                const col = auth.api.db.collection<AIModelCommits>(Collections.AIModelCommits)
                const commits = await col
                    .where('owner.id', '==', auth.user.polybaseUser)
                    .where('link', '==', link)
                    .get().catch(() => null)
                if (commits?.data && commits.data.length > 0) {                    // put A before B if major version is greater
                    // < 0 => sort a before b, e.g. [a, b]
                    commits.data.sort((a, b) => b.data.version.major - a.data.version.major)
                    setCommits(commits.data)
                }
            }
        }
        getModels().catch(console.error)
    }, [auth, link]);

    if (!auth.user?.ethereumAddress) {
        return (<>
                <div className='w-full h-full flex flex-col justify-between'>
                    {'Connect your metamask account'}
                </div></>
        )
    }

    return (
        <>
            <div className='w-full h-full flex flex-col justify-between'>
                {commits?.map(d => <Model key={d.id} data={d.data} />) || 'No AI model commits'}
            </div>
        </>
    )
}
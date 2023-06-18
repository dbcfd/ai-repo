"use client"

import React, { useState } from 'react'
import { AIModelCommits, Collections } from '@/utils'
import { AuthContext } from '@/features/auth'
import { Model } from './Model';

export function ModelCommits({link}: {link?: string}) {
    const [commits, setCommits] = useState<Array<AIModelCommits>>([])
    // const { account } = useParams()
    const { api, user } = React.useContext(AuthContext)

    React.useEffect(() => {
        async function getModels() {
            if (user && link) {
                const col = api.db.collection<AIModelCommits>(Collections.AIModelCommits)
                const commits = await col
                    .where('owner.id', '==', user.polybaseUser)
                    .where('link', '==', link)
                    .get().catch(() => null)
                if (commits?.data && commits.data.length > 0) {                    // put A before B if major version is greater
                    // < 0 => sort a before b, e.g. [a, b]
                    commits.data.sort((a, b) => b.data.version.major - a.data.version.major)
                    setCommits(commits.data.map((c) => c.data))
                }
            }
        }
        getModels().catch(console.error)
    }, [api, user, link]);

    return (
        <>
            <div className='w-full h-full flex flex-col justify-between'>
                {commits.map(d => <Model key={d.id} data={d} />)}
            </div>
        </>
    )
}
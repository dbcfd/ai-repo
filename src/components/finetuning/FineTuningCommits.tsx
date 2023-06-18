"use client"

import React, { useState } from 'react'
import { Collections, FineTuningCommits } from '@/utils'
// import { useParams } from "next/navigation";
import Link from 'next/link'
import { AuthContext } from '@/features/auth'
import { CollectionRecordResponse } from '@polybase/client';
import { FineTuning } from './FineTuning';
import GetFineTunings from "@/components/finetuning/GetFineTunings";

export function FineTuningCommits({link}:{link?: string}) {
    const [commits, setCommits] = useState<Array<FineTuningCommits>>([])
    // const { account } = useParams()
    const { api, user } = React.useContext(AuthContext)

    React.useEffect(() => {
        async function getFineTuningCommits() {
            if (user && link) {
                const col = api.db.collection<FineTuningCommits>(Collections.FineTuningCommits)
                const commits = await col
                    .where('owner', '==', user.polybaseUser)
                    .where('link', '==', link)
                    .get().catch(() => null)
                if (commits?.data && commits.data.length > 0) {
                    // put A before B if major version is greater
                    commits.data.sort((a, b) => b.data.version.major - a.data.version.major )

                    setCommits(commits.data.map((c) => c.data))
                }
            }
        }
        getFineTuningCommits().catch(console.error)
    }, [api, user, link]);

    return (
        <>
            <div className='w-full h-full flex flex-col justify-between'>
                <hr/>
                {commits.map(commit => {
                    return <FineTuning key={commit.id} data={commit} />
                }) || 'No commits'}
            </div>
        </>
    )
}
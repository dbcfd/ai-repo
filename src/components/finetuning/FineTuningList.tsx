"use client"

import React, { useState } from 'react'
import { Collections, FineTuningCommits } from '../../utils/types'
import { useParams } from "next/navigation";
import Link from 'next/link'
import { AuthContext } from '@/features/auth'
import { CollectionRecordResponse } from '@polybase/client';
import { FineTuning } from './FineTuning';

export function FineTuningList() {

    const [commits, setCommits] = useState<CollectionRecordResponse<FineTuningCommits, FineTuningCommits>[] | null>(null)
    const { account } = useParams()
    const { auth, } = React.useContext(AuthContext)

    React.useEffect(() => {
        async function getFineTunings() {
            if (auth) {

                const col = auth.db.collection<FineTuningCommits>(Collections.FineTuningCommits)
                const commits = await col.where('owner', '==', auth.polybaseUser).get().catch(() => null)
                if (commits?.data && commits.data.length > 0) {
                    // put A before B if major version is greater
                    commits.data.sort((a, b) => b.data.version.major - a.data.version.major )

                    setCommits(commits.data)
                }
            }
        }
        getFineTunings()
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
                {commits?.map(commit => {
                    return <FineTuning key={commit.id} data={commit.data} />
                }) || 'No commits'}
            </div>
        </>
    )
}
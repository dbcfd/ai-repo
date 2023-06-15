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
                const commits = await col.where('owner', '==', auth.ethereumAddress).sort('version.major', 'desc').get().catch(() => null)
                if (commits) {
                    const { data, cursor } = commits
                    setCommits(data)
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
                {commits?.map(d => <FineTuning data={d.data} />) || 'No commits'}
            </div>
        </>
    )
}
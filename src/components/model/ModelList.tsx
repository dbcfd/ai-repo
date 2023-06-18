"use client"

import React, {useState} from 'react'
import GetAIModels from "@/components/model/GetAIModels";
import {ModelCommits} from "@/components/model/ModelCommits";

export function ModelList() {
    const [commit, setCommit] = useState<string | undefined>()
    return (
        <>
            <div className='w-full h-full flex flex-col justify-between'>
                <GetAIModels onSelectCommit={setCommit}/>
            </div>
            <div className='w-full h-full flex flex-col justify-between'>
                Commits
                <hr/>
                <ModelCommits link={commit}/>
            </div>
        </>
    )
}
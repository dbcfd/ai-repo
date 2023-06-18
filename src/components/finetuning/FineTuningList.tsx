"use client"

import React, {useState} from 'react'
import GetFineTunings from "@/components/finetuning/GetFineTunings";
import {FineTuningCommits} from "@/components/finetuning/FineTuningCommits";
import AddFineTuning from "@/components/finetuning/AddFineTuning";

export function FineTuningList() {
    const [commit, setCommit] = useState<string | undefined>()
    return (
        <>
            <div className='w-full h-full flex flex-col justify-between'>
                <GetFineTunings onSelectCommit={setCommit}/>
            </div>
            <div className='w-full h-full flex flex-col justify-between'>
                Commits
                <hr/>
                <FineTuningCommits link={commit}/>
            </div>
            <div className='w-full h-full flex flex-col justify-between'>
                <AddFineTuning/>
            </div>
        </>
    )
}
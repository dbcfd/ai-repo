"use client"

import React, {useState} from 'react'
import GetAIModels from "@/components/model/GetAIModels";
import {ModelCommits} from "@/components/model/ModelCommits";
import AddAIModel from "@/components/model/AddAIModel";

export function ModelList() {
    const [commit, setCommit] = useState<string | undefined>()
    return (
        <>
            <div className='w-full h-full flex flex-col justify-between'>
                Models
                <hr/>
                <GetAIModels onSelectCommit={setCommit}/>
            </div>
            <div className='w-full h-full flex flex-col justify-between'>
                Commits
                <hr/>
                <ModelCommits link={commit}/>
            </div>
            <div className='w-full h-full flex flex-col justify-between'>
                Add AI Model
                <hr/>
                <AddAIModel/>
            </div>
        </>
    )
}
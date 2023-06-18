"use client"

import React, {useState} from 'react'
import GetFineTunings from "@/components/finetuning/GetFineTunings";
import {FineTuningCommits} from "@/components/finetuning/FineTuningCommits";
import AddFineTuning from "@/components/finetuning/AddFineTuning";

export function FineTuningList() {
    return (
        <>
            <div className='w-full h-full flex flex-col justify-between'>
                Fine Tunings
                <hr/>
                <GetFineTunings/>
            </div>
            <div className='w-full h-full flex flex-col justify-between'>
                Commits
                <hr/>
                <FineTuningCommits link={undefined}/>
            </div>
            <div className='w-full h-full flex flex-col justify-between'>
                <AddFineTuning/>
            </div>
        </>
    )
}
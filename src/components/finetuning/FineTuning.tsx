"use client"

import { FineTuningCommits } from "@/utils/types"

export function FineTuning({ data }: { data: FineTuningCommits }) {
    return (
        <>
            <div className='w-full h-full flex flex-col justify-between'>
                {data.id}
                {data.commitLog}
                {`${data.version.major}.${data.version.minor}.${data.version.patch}`}
            </div>
        </>
    )
}
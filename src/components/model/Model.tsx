"use client"

import { AIModelCommits, } from '../../utils/types'


export function Model({ data }: { data: AIModelCommits }) {
    return (
        <>
            <div className='w-full h-full flex flex-col justify-between'>
                {data.id}
                {`FineTunes: ${data.finetunes.map(f => f.id)}`}
                {data.commitLog}
                {`${data.version.major}.${data.version.minor}.${data.version.patch}`}
            </div>
        </>
    )
}
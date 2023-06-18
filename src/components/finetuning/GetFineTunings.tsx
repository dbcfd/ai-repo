import {ReactNode, useContext, useEffect, useState} from "react";
import {QueryEdge, Version} from "@/components";
import AddAIModel from "@/components/model/AddAIModel";
import Link from 'next/link'
import {AuthContext} from "@/features/auth";
import {FineTuning} from "@/components/finetuning/index";

const GET_FINE_TUNINGS = `
    query GetFineTunings {
        fineTuningIndex(first: 10) {
            edges {
                node {
                    id
                    name
                    version {
                        major
                        minor
                        patch
                        preRelease
                        build
                    }
                    description
                    tags
                    tuning {
                        prompt
                        completion
                    }
                    commitLog
                    link
                }
            }
        }
    }
`

type Result = {
    fineTuningIndex: {
        edges: Array<QueryEdge<FineTuning>>
    }
}

export type SelectHandler = (id: string) => void

export default function GetFineTunings({onSelectCommit}: {onSelectCommit: SelectHandler}) {
    const { auth } = useContext(AuthContext)
    const [fineTunings, setFineTunings] = useState<Array<FineTuning>>([])

    const getFineTunings = async () => {
        const result = await auth?.composedb.executeQuery(GET_FINE_TUNINGS)
        console.log(result)
        if (result && result.data) {
            const res = result as Result
            setFineTunings(res.fineTuningIndex.edges.map((e) => e.node))
        }
    }

    function displayFineTunings() {
        console.log(`ComposeDB return: ${fineTunings}`)
        if(fineTunings.length == 0) {
            return <div>No FineTunings</div>
        }
        return <div>
            {fineTunings.map((edge) => {
                return (<>
                <div>${edge.name}</div>
                <div>${edge.description}</div>
                <div onClick={() => onSelectCommit(edge.link)}>Commits</div>
                <Link href='../model/AddAiModel'>Train</Link>
                </>)
            })}
        </div>
    }

    useEffect(() => {
        getFineTunings()
    })

    return displayFineTunings()
}
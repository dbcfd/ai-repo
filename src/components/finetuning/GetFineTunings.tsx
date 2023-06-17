import {ReactNode, useContext} from "react";
import {ComposeDBContext} from "@/features/composedb";
import { gql, useQuery } from '@apollo/client';
import {QueryEdge, Version} from "@/components";
import AddAIModel from "@/components/model/AddAIModel";
import Link from 'next/link'

const GET_FINE_TUNINGS = gql`
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

type FineTune = {
    prompt: string
    completion: string
}

type FineTuning = {
    id: string
    name: string
    version: Version
    description: string
    tags: Array<string>
    tuning: Array<FineTune>
    commitLog: string
    link: string
}

export type SelectHandler = (id: string) => void

export default function GetFineTunings({onSelectCommit}: {onSelectCommit: SelectHandler}) {
    const composeDB = useContext(ComposeDBContext)

    const { loading, error, data } = useQuery(GET_FINE_TUNINGS);

    if (loading) return <p>'Submitting...'</p>;

    if (error) return <p>`Submission error! ${error.message}`</p>;

    function displayFineTunings() {
        if(data.fineTuningIndex.edges.length == 0) {
            return <div>No FineTunings</div>
        }
        return <div>
            {data.fineTuningIndex.edges.map((edge: QueryEdge<FineTuning>) => {
                <>
                <div>${edge.node.name}</div>
                <div>${edge.node.description}</div>
                <div onClick={() => onSelectCommit(edge.node.link)}>Commits</div>
                <Link href='../model/AddAiModel'>Train</Link>
                </>
            })}
        </div>
    }

    return displayFineTunings()
}
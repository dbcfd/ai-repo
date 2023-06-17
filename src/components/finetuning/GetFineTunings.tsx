import {ReactNode, useContext} from "react";
import {ComposeDBContext} from "@/features/composedb";
import { gql, useQuery } from '@apollo/client';
import {QueryEdge, Version} from "@/components";
import AddAIModel from "@/components/model/AddAIModel";
import { Link } from 'react-router-dom'

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

    if (loading) return 'Submitting...';

    if (error) return `Submission error! ${error.message}`;

    function displayFineTunings(): ReactNode {
        if(data.fineTuningIndex.edges.length == 0) {
            return <div>No FineTunings</div>
        }
        return <div>
            {data.fineTuningIndex.edges.map((edge: QueryEdge<FineTuning>) => {
                <>
                <div>${edge.node.name}</div>
                <div>${edge.node.description}</div>
                <div onClick={() => onSelectCommit(edge.node.link)}>Commits</div>
                <Link to='../model/AddAiModel' state={{fineTuningId: edge.node.id}}>Train</Link>
                </>
            })}
        </div>
    }

    return displayFineTunings()
}
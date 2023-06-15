import {useContext} from "react";
import {ComposeDBContext} from "@/features/composedb";
import { gql, useQuery } from '@apollo/client';
import {QueryEdge, Version} from "@/components";

const GET_FINE_TUNINGS = gql`
    query GetFineTunings {
        fineTuningIndex(first: 10) {
            edges {
                node {
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
    version: Version
    description: string
    tags: Array<string>
    tuning: Array<FineTune>
}

export default function GetFineTunings() {
    const composeDB = useContext(ComposeDBContext)

    const { loading, error, data } = useQuery(GET_FINE_TUNINGS);

    if (loading) return 'Submitting...';

    if (error) return `Submission error! ${error.message}`;

    return (
        <div>
            {data.fineTuningIndex.edges.map((edge: QueryEdge<FineTuning>) => {
                <div>${edge.node.description}</div>
            })}
        </div>
    )
}
import {useContext} from "react";
import {ComposeDBContext} from "@/features/composedb";
import { gql, useQuery } from '@apollo/client';

const GET_AI_MODELS = gql`
    query GetAIModels {
        aiModelIndex(first: 10) {
            edges {
                node {
                    version {
                        major
                        minor
                        patch
                        preRelease
                        build
                    }
                    commitLog
                    link
                    name
                    baseModel
                    description
                    tags
                }
            }
        }
    }
`

export default function GetAiModels({state}) {
    const composeDB = useContext(ComposeDBContext)

    const { loading, error, data } = useQuery(GET_AI_MODELS);

    if (loading) return 'Submitting...';

    if (error) return `Submission error! ${error.message}`;

    return (
        <div>
            {data.edges.map((model) => {
                <div></div>
            })}
        </div>
    )
}
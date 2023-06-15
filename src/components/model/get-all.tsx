import {useContext} from "react";
import {ComposeDBContext} from "@/features/composedb";
import { gql, useQuery } from '@apollo/client';
import {QueryEdge, Version} from "@/components";
import {BaseModel} from "@/components/model/add";

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

export type AIModel = {
    name: string
    version: Version
    commitLog: string
    link: string
    baseModel: BaseModel
    tags: Array<string>
    description: string
}

export default function GetAiModels() {
    const composeDB = useContext(ComposeDBContext)

    const { loading, error, data } = useQuery(GET_AI_MODELS);

    if (loading) return 'Submitting...';

    if (error) return `Submission error! ${error.message}`;

    return (
        <div>
            {data.edges.map((edge: QueryEdge<AIModel>) => {
                edge.node.description
            })}
        </div>
    )
}
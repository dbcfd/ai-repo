import {useContext, useEffect, useState} from "react";
import {QueryEdge, Version} from "@/components";
import {BaseModel} from "@/components/model/AddAIModel";
import {AuthContext} from "@/features/auth";

const GET_AI_MODELS = `
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

type Result = {
    aiModelIndex: {
        edges: Array<QueryEdge<AIModel>>
    }
}

export type SelectHandler = (id: string) => void

export default function GetAIModels({onSelectCommit}: {onSelectCommit: SelectHandler}) {
    const { auth } = useContext(AuthContext)
    const [aiModels, setAiModels] = useState<Array<AIModel>>([])

    const getAIModels = async () => {
        const result = await auth?.composedb.executeQuery(GET_AI_MODELS)
        console.log(result)
        if (result && result.data) {
            const res = result as Result
            setAiModels(res.aiModelIndex.edges.map((e) => e.node))
        }
    }

    useEffect(() => {
        getAIModels()
    })

    function displayModels() {
        if(aiModels.length == 0) {
            return <p>No models found</p>
        } else {
            return (
                <div>
                    {aiModels.map((model) => {
                        return model.description
                    })}
                </div>
                )
        }
    }

    return (
        displayModels()
    )
}
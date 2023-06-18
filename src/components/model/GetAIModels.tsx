import {useContext, useEffect, useState} from "react";
import {QueryData, QueryEdge, Version} from "@/components";
import {BaseModel} from "@/components/model/AddAIModel";
import {AuthContext} from "@/features/auth";

const GET_AI_MODELS = `
    query GetAIModels {
        aIModelIndex(last: 50) {
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
    aIModelIndex: QueryData<AIModel>
}

export type SelectHandler = (id: string) => void

export default function GetAIModels({onSelectCommit}: {onSelectCommit: SelectHandler}) {
    const { auth } = useContext(AuthContext)
    const [aiModels, setAiModels] = useState<Array<AIModel>>([])

    const getAIModels = async () => {
        const result = await auth.api.composedb.executeQuery(GET_AI_MODELS)
        if (result && result.data) {
            const res = result.data as Result
            const models = res.aIModelIndex.edges.map((e) => e.node)
            setAiModels(models)
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
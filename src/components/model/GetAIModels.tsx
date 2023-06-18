import {useContext, useEffect, useState} from "react";
import {BaseModel} from "@/components/model/AddAIModel";
import {AuthContext} from "@/features/auth";
import {QueryData, Version, versionAsString} from "@/utils";

const GET_AI_MODELS = `
    query GetAIModels {
        aIModelIndex(last: 50) {
            edges {
                node {
                    id
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
    id: string
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
    const { api } = useContext(AuthContext)
    const [aiModels, setAiModels] = useState<Array<AIModel>>([])

    const getAIModels = async () => {
        const result = await api.composedb.executeQuery(GET_AI_MODELS)
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
            return <div className="flex justify-between items-center w-full">No Models</div>
        }
        return <div>
            {aiModels.map((model) => {
                return (
                    <div key={model.id}>
                        {model.name} @ {versionAsString(model.version)} - {model.description}
                    </div>
                )
            })}
        </div>
    }

    return (
        displayModels()
    )
}
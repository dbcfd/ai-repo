"use client"

import {useContext, useEffect, useState} from "react";
import {AuthContext} from "@/features/auth";
import {FineTuning} from "@/components/finetuning/index";
import {QueryData, versionAsString} from "@/utils";

const GET_FINE_TUNINGS = `
    query GetFineTunings {
        fineTuningIndex(last: 50) {
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
    fineTuningIndex: QueryData<FineTuning>
}

export default function GetFineTunings() {
    const { api } = useContext(AuthContext)
    const [fineTunings, setFineTunings] = useState<Array<FineTuning>>([])

    const getFineTunings = async () => {
        const result = await api.composedb.executeQuery(GET_FINE_TUNINGS)
        if(result.data) {
            const res = result.data as Result
            const ft = res.fineTuningIndex.edges.map((e) => e.node)
            setFineTunings(ft)
        } else if (result.errors) {
            console.error(`Failed to get fine tunings: ${result.errors}`)
        }
    }

    function displayFineTunings() {
        if(fineTunings.length == 0) {
            return <div className="flex justify-between items-center w-full">No FineTunings</div>
        }
        return <div>
            {fineTunings.map((ft) => {
                return (<>
                    <div key={ft.id}>
                        {ft.name}@{versionAsString(ft.version)} [{ft.link}] - {ft.description}
                    </div>
                    <br/>
                    </>
                )
            })}
        </div>
    }

    useEffect(() => {
        getFineTunings()
    })

    return displayFineTunings()
}
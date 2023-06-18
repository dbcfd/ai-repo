"use client"

import {ReactNode, useContext, useEffect, useState} from "react";
import {QueryData, QueryEdge, Version} from "@/components";
import AddAIModel from "@/components/model/AddAIModel";
import {AuthContext} from "@/features/auth";
import {FineTuning} from "@/components/finetuning/index";
import { Link } from 'react-router-dom'

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
    const { auth } = useContext(AuthContext)
    const [fineTunings, setFineTunings] = useState<Array<FineTuning>>([])

    const getFineTunings = async () => {
        const result = await auth.api.composedb.executeQuery(GET_FINE_TUNINGS)
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
        return <div className="flex justify-between items-center w-full">
            {fineTunings.map((ft) => {
                return (<div key={ft.id}>
                <div key={ft.id+'_name'}>{ft.name}</div>
                <div key={ft.id+'_desc'}>{ft.description}</div>
                </div>)
            })}
        </div>
    }

    useEffect(() => {
        getFineTunings()
    })

    return displayFineTunings()
}
import {useContext, useEffect, useState} from "react";
import {Api, AuthContext} from "@/features/auth";
import {Version} from "@/utils";
import {FineTuning} from "@/components/finetuning/index";

const GET_FINE_TUNING = `
    query GetFineTuning($id:ID!) {
      node(id: $id) {
        ... on FineTuning {
          id
          tags
          version {
            major
            minor
            patch
          }
          description
          link
        }
      }
    }
`

export async function getFineTuning(api: Api, id: string): Promise<FineTuning> {
    const res = await api.composedb.executeQuery(GET_FINE_TUNING, { id: id})
    const data = res?.data ?? {}
    return data as FineTuning
}

export default function GetFineTuning({id}: {id: string}) {
    const { api } = useContext(AuthContext)
    const [fineTuning, setFineTuning] = useState<FineTuning | null>(null)

    const getFineTuningEffect = async () => {
        const data = await getFineTuning(api, id)
        setFineTuning(data)
    }

    useEffect(() => {
        getFineTuningEffect()
    })

    if (fineTuning) {
        return (
            <div>
                {fineTuning.description}
            </div>
        )
    } else {
        return <div>No fine tuning found</div>
    }
}
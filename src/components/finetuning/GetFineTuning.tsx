import {useContext, useEffect, useState} from "react";
import {AuthContext} from "@/features/auth";
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
        }
      }
    }
`

export default function GetFineTuning({id}: {id: string}) {
    const auth = useContext(AuthContext)
    const [fineTuning, setFineTuning] = useState<FineTuning | null>(null)

    const getFineTuning = async () => {
        const res = await auth.auth.api.composedb.executeQuery(GET_FINE_TUNING, { id: id})
        const data = res?.data ?? {}
        setFineTuning(data as FineTuning)
    }

    useEffect(() => {
        getFineTuning()
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
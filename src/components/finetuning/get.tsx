import {useContext} from "react";
import {ComposeDBContext} from "@/features/composedb";
import { gql, useQuery } from '@apollo/client';

const GET_FINE_TUNING = gql`
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

export default function GetFineTuning({state, id}) {
    const composeDB = useContext(ComposeDBContext)

    const { loading, error, data } = useQuery(GET_FINE_TUNING);

    if (loading) return 'Submitting...';

    if (error) return `Submission error! ${error.message}`;

    return (
        <div>

        </div>
    )
}
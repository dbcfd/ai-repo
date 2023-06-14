import {useContext} from "react";
import {ComposeDBContext} from "@/features/composedb";
import { gql, useQuery } from '@apollo/client';

const GET_FINE_TUNINGS = gql`
    query GetFineTunings {
        fineTuningIndex(first: 10) {
            edges {
                node {
                    version {
                        major
                        minor
                        patch
                        preRelease
                        build
                    }
                    tags
                    tuning {
                        data
                        replacement
                    }
                }
            }
        }
    }
`

export default function GetFineTunings({state}) {
    const composeDB = useContext(ComposeDBContext)

    const { loading, error, data } = useQuery(GET_FINE_TUNINGS);

    if (loading) return 'Submitting...';

    if (error) return `Submission error! ${error.message}`;

    return (
        <div>
            {data.fineTuningIndex.edges.map((fineTuning) => {
                <div></div>
            })}
        </div>
    )
}
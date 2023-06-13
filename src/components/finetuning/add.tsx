import {useContext} from "react";
import {ComposeDBContext} from "@/features/composedb";
import { gql, useQuery } from '@apollo/client';
import * as semver from 'semver'

const CREATE_FINE_TUNING = gql`
    mutation CreateFineTuning($i: CreateFineTuningInput!){
        createFineTuning(input: $i){
            clientMutationId
        }
    }
`

///{
//   "i": {
//     "content": {
//       "version": {
//         "major": 1,
//         "minor": 0,
//         "patch": 0
//       },
//       "tags": ["test"],
//       "description": "FineTuning Test",
//       "creator": "some_did"
//     }
//   }
// }

export default function GetFineTunings({state}) {
    const composeDB = useContext(ComposeDBContext)

    const [addFineTuning, { data, loading, error }] = useQuery(CREATE_FINE_TUNING);

    if (loading) return 'Submitting...';

    if (error) return `Submission error! ${error.message}`;

    const handleSubmit = async (event) => {
        // Stop the form from submitting and refreshing the page.
        event.preventDefault()

        const version = semver.parse(event.version)
        const description = event.description
        const tags = event.tags.split(',')

        // Get data from the form.
        const input = {
            version,
            tags,
            description,
            creator: composeDB.did
        }

        addFineTuning(input)

        const id = data.clientMutationId
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="version">Version (Semver)</label>
            <input type="text" id="version" name="version" required />

            <label htmlFor="description">Description</label>
            <input type="text" id="description" name="description" required />

            <label htmlFor="tags">Tags (Comma Separated)</label>
            <input type="text" id="tags" name="tags" required />

            <label htmlFor="tuning">Tuning</label>
            <textarea rows="10" cols="60" name="tuning" placeholder="input1,output1<br>input2,output2" />

            <button type="submit">Add FineTuning</button>
        </form>
    )
}
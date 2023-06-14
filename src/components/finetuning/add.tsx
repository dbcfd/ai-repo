import {useContext, useState} from "react";
import {ComposeDBContext} from "@/features/composedb";
import {gql, useMutation} from '@apollo/client';
import * as semver from 'semver'
import {OpenAIContext} from "@/features/openai";
import * as fs from 'fs';
import * as rd from 'readline'

const CREATE_FINE_TUNING = gql`
    mutation CreateFineTuning($i: CreateFineTuningInput!){
        createFineTuning(input: $i){
            document {
                id
            }
        }
    }
`

/**
{
  "i": {
    "content": {
      "version": {
        "major": 1,
        "minor": 0,
        "patch": 0
      },
      "description": "FineTuning Test",
      "tags": ["test"],
      "tuning": [{"prompt":"test","completion":"test"}],
      "commitLog": "polybase-id",
      "link": "open ai file id"
    }
  }
}
**/

type FineTuning = {
    prompt: string,
    completion: string,
}

export default function AddFineTuning({state}) {
    const [selectedFile, setSelectedFile] = useState(null)
    const composeDB = useContext(ComposeDBContext)
    const openAI = useContext(OpenAIContext)

    const [addFineTuning, { data, loading, error }] = useMutation(CREATE_FINE_TUNING);

    if (loading) return 'Submitting...';

    if (error) return `Submission error! ${error.message}`;

    const onFileChange = (event) => {
        setSelectedFile(event.target.files[0])
    };

    const handleSubmit = async (event) => {
        // Stop the form from submitting and refreshing the page.
        event.preventDefault()

        if(!selectedFile) {
            return <div>No File Selected</div>
        }

        const reader = rd.createInterface(fs.createReadStream(selectedFile))
        const fineTunes = []
        reader.on('line', (l: string) => {
            const ft: FineTuning = JSON.parse(l)
            fineTunes.push(ft)
        })

        const name = event.name
        const version = semver.parse(event.version)
        const description = event.description
        const tags = event.tags.split(',')

        const createFineTuneResponse = await openAI.api.createFile(selectedFile, 'fine-tune')

        //TODO write to polybase

        // Get data from the form.
        const input = {
            name,
            version,
            tags,
            description,
            creator: composeDB.did,
            link: createFineTuneResponse.data.id,
            commitLog: 'blah',
        }

        addFineTuning(input)

        const id = data.document.id
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" required />

            <label htmlFor="version">Version (Semver)</label>
            <input type="text" id="version" name="version" required />

            <label htmlFor="description">Description</label>
            <input type="text" id="description" name="description" required />

            <label htmlFor="tags">Tags (Comma Separated)</label>
            <input type="text" id="tags" name="tags" required />

            <input type="file" onChange={onFileChange} />

            <button type="submit">Add FineTuning</button>
        </form>
    )
}
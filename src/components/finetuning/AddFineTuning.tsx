import {ChangeEvent, FormEvent, useContext, useState} from "react";
import * as semver from 'semver'
import {OpenAIContext} from "@/features/openai";
import {AuthContext} from "@/features/auth";

const CREATE_FINE_TUNING = `
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
      "creator": "account did",
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

export default function AddFineTuning() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const { auth } = useContext(AuthContext)
    const openAI = useContext(OpenAIContext)

    if (!openAI) {
        return <p>Provide OpenAI API Key</p>
    }

    const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0)
        setSelectedFile(event.target.files[0])
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        // Stop the form from submitting and refreshing the page.
        event.preventDefault()

        if(!selectedFile) {
            return <div>No File Selected</div>
        }

        const doSubmit = async () => {
            let fineTunes = []
            const reader = new FileReader()
            reader.onload = async (e) => {
                if (!(e.target && e.target.result)) {
                    return
                }
                fineTunes = e.target.result.toString().split(/\r\n|\r|\n/).map((l) => JSON.parse(l))
            }
            await reader.readAsText(selectedFile)

            const target = event.target as typeof event.target & {
                name: { value: string };
                version: { value: string };
                description: { value: string };
                tags: { value: string };
            };

            const name = target.name.value
            const version = semver.parse(target.version.value)
            const description = target.description.value
            const tags = target.tags.value.split(',')

            const createFineTuneResponse = await openAI.api.createFile(selectedFile, 'fine-tune')

            //TODO write to polybase

            // Get data from the form.
            const input = {
                creator: auth?.didSession.did,
                name,
                version,
                tags,
                description,
                link: createFineTuneResponse.data.id,
                commitLog: 'blah',
            }

            const res = await auth?.composedb.executeQuery(CREATE_FINE_TUNING, input)

            const id = res?.data?.id
        }

        doSubmit().catch(console.log)
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
import {FormEvent, useContext, useState} from "react";
import * as semver from 'semver'
import {OpenAIContext} from "@/features/openai";
import {AuthContext} from "@/features/auth";

const GET_FINE_TUNE = `

`

const CREATE_AI_MODEL = `
    mutation CreateAIModel($i: CreateAIModelInput!){
        createAIModel(input: $i){
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
      "commitLog": "polybase-id",
      "link": "openai-id",
      "name": "test model",
      "baseModel":
      "tags": ["test"],
      "description": "FineTuning Test",
    }
  }
}
 **/

export enum BaseModel {
    Ada = 'Ada',
    Babbage = 'Babbage',
    Curie = 'Curie',
    Davinci = 'Davinci',
}

type Result = {
    createAIModel: {
        document: {
            id: string
        }
    }
}

export default function AddAIModel({finetuning}: {finetuning?: string}) {
    const [created, setCreated] = useState(<div/>)
    const { api } = useContext(AuthContext)
    const openAI = useContext(OpenAIContext)

    if (!openAI) return <p>No OpenAI connection</p>

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        const doSubmit = async () => {
            // Stop the form from submitting and refreshing the page.
            event.preventDefault()

            const target = event.target as typeof event.target & {
                name: { value: string };
                version: { value: string };
                description: { value: string };
                tags: { value: string };
                finetune: { value: string };
            };

            const name = target.name.value
            const semverVersion = semver.parse(target.version.value)
            if (!semverVersion) {
                setCreated(<div>Invalid Version</div>)
                return
            }
            const version = {
                major: semverVersion.major,
                minor: semverVersion.minor,
                patch: semverVersion.patch,
            }
            const description = target.description.value
            const tags = target.tags.value.split(',')
            const model = BaseModel.Davinci

            const req = {
                training_file: target.finetune.value,
                model: model.toString().toLowerCase(),
                suffix: name.trim().replace(' ', '_'),
            }

            console.log(`FineTune=${JSON.stringify(req)}`)

            const fineTuneResponse = await openAI.api.createFineTune(req)
            console.log(`Trained as ${fineTuneResponse.data.id}`)

            //TODO write to polybase

            // Get data from the form.
            const content = {
                name,
                version: {
                    major: version.major,
                    minor: version.minor,
                    patch: version.patch,
                },
                tags,
                description,
                baseModel: model,
                creator: "did:key:z6MkngiTvSAWB22emEMWkRwQYEDiEiSBtJZwv8pp3mvpKVxX",
                link: fineTuneResponse.data.id,
                commitLog: 'polybase id',
            }

            const variables = { i: { content } }

            const res = await api.composedb.executeQuery(CREATE_AI_MODEL, variables)

            if (res.data) {
                console.log(`Result=${JSON.stringify(res.data)}`)
                const result = res.data as Result

                if(result.createAIModel) {
                    const id = result.createAIModel.document.id

                    setCreated(<div>Successfully created ${id}</div>)
                } else {
                    setCreated(<div>ComposeDB failed to return id</div>)
                }
            } else if (res.errors) {
                console.error(`Creation failed: ${JSON.stringify(variables)}`)
                setCreated(<div>Creation failed: {res.errors.toString()}</div>)
            }
        }

        doSubmit().catch(console.log)
    }

    return (
        <div>
        <form onSubmit={handleSubmit} className='flex flex-col mt-12'>
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" required className='rounded p-2 mb-2 text-black' />

            <label htmlFor="version">Version (Semver)</label>
            <input type="text" id="version" name="version" required className='rounded p-2 mb-2 text-black' />

            <label htmlFor="description">Description</label>
            <input type="text" id="description" name="description" required className='rounded p-2 mb-2 text-black' />

            <label htmlFor="tags">Tags (Comma Separated)</label>
            <input type="text" id="tags" name="tags" required className='rounded p-2 mb-2 text-black' />

            <label htmlFor="finetune">Fine Tune</label>
            <input type="text" id="finetune" name="finetune" required className='rounded p-2 mb-2 text-black' defaultValue="file-SLcdV1T3FE6e5tyxYf83A6zl"/>

            <button type="submit" className='bg-blue-purple-light text-white py-2.5 px-4 mt-4 uppercase rounded flex items-center justify-center'>Create Model</button>
        </form>
        <hr/>
        <div>{created}</div>
        </div>
    )
}
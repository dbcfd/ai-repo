import {FormEvent, useContext, useState} from "react";
import * as semver from 'semver'
import {OpenAIContext} from "@/features/openai";
import {Version} from "@/components";
import {AuthContext} from "@/features/auth";

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

export default function AddAIModel({finetuning}: {finetuning: string}) {
    const { auth } = useContext(AuthContext)
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
            const version = semver.parse(target.version.value)
            const description = target.description.value
            const tags = target.tags.value.split(',')
            const model = BaseModel.Davinci

            const fineTuneResponse = await openAI.api.createFineTune({
                training_file: target.finetune.value,
                model: model.toString(),
                suffix: name.trim(),
            })

            //TODO write to polybase

            // Get data from the form.
            const input = {
                version,
                tags,
                description,
                baseModel: model,
                creator: auth?.didSession.did,
                link: fineTuneResponse.data.id,
                commitLog: 'polybase id',
            }

            const res = await auth?.composedb.executeQuery(CREATE_AI_MODEL, input)
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

            <label htmlFor="finetune">Fine Tune</label>
            <input type="text" id="finetune" name="finetune" required />

            <button type="submit">Add FineTuning</button>
        </form>
    )
}
import {Version} from "@/components";

export * from './FineTuningList'

export type FineTune = {
    prompt: string
    completion: string
}

export type FineTuning = {
    id: string
    name: string
    version: Version
    description: string
    tags: Array<string>
    tuning: Array<FineTune>
    commitLog: string
    link: string
}
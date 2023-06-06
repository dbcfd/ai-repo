import {PublicKey} from "@polybase/client";

export interface User {
    id: string
    name?: string
    publicKey: PublicKey
    apikey: string
}

export interface Version {
    id: string
    major: number
    minor: number
    patch: number
    preRelease?: string
    build?: string
}

export interface FineTuning {
    id: string
    previous?: string
    version: Version
    description: string
    tags: string[]
    finetunes: string[]
    owner: User
}

export interface Model {
    id: string
    name: string
    basemodel: string
    previous?: Model
    version: Version
    finetunes: FineTuning[]
    owner: User
}

export const DATABASE = 'ai.repo'

export enum Collections {
    User = DATABASE + '/User',
    Version = DATABASE + '/Version',
    FineTuning = DATABASE + '/FineTuning',
    Model = DATABASE + '/Model',
}
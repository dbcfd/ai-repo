import { PublicKey } from "@polybase/client";

export interface User {
    id: string;
    name?: string;
    publicKey: PublicKey;
    apiKey: string;
}

export interface Version {
    id: string
    major: number
    minor: number
    patch: number
    preRelease?: string
    build?: string
}

export function versionAsString(version: Version): string {
    let preRelease = ''
    if (version.preRelease) {
        `-${version.preRelease}`
    }
    let build = ''
    if (version.build) {
        `+${version.build}`
    }
    return `${version.major}.${version.minor}.${version.patch}${preRelease}${build}`
}

export interface FineTuningCommits {
    id: string
    commitLog: string
    version: Version
    owner: User
}

export interface AIModelCommits {
    id: string
    commitLog: string
    version: Version
    finetunes: FineTuningCommits[]
    owner: User
}

export enum Collections {
    User = 'User',
    Version = 'Version',
    FineTuningCommits = 'FineTuningCommits',
    AIModelCommits = 'AIModelCommits',
}

export type QueryEdge<T> = {
    node: T
}

export type QueryData<T> = {
    edges: Array<QueryEdge<T>>
}
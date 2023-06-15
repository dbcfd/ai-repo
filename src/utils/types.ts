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
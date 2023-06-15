export * from './login'

export type Version = {
    major: string
    minor: string
    patch: string
    preRelease?: string
    build?: string
}

export type QueryEdge<T> = {
    node: T
}
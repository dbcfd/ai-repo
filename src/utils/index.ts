export * from './format'

export interface Account {
    id: string; 
    name?: string;
    publicKey: string;
    apiKey: string;
  }
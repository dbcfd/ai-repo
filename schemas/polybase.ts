import { Polybase } from '@polybase/client'
import Wallet from 'ethereumjs-wallet'
import { ethPersonalSign } from '@polybase/eth'

// PK, need to establish a PK so we can control updates

const schema = `
@public
collection User {
  id: string; 
  name?: string;
  pvkey: string;
  $pk: string;
  apikey: string;

  constructor (id: string, pvkey: string, apikey: string) {
    this.id = id;
    this.$pk = ctx.publicKey.toHex();
    this.pvkey = pvkey;
    this.apikey = apikey;
  }

  setProfile(name: string) {
    if (this.$pk != ctx.publicKey.toHex()) {
      throw error ('invalid owner');
    }
    this.name = name ?? this.name
  }
  
  setAPIKey(key: string) {
    if (this.$pk != ctx.publicKey.toHex()) {
      throw error ('invalid owner');
    }
    this.apikey = key ?? this.apikey
  }
}

@public
collection FineTuning {
  id: string;
  $pk: string;
  version: string;
  description: string;
  tags: string[];
  finetunes: string[];
  
  owner: User;
  
  @index(description, version)
  
  constructor(id: string, description: string, tags: string[], version: string, finetunes: string[]) {
    this.id = id;
    this.$pk = ctx.publicKey.toHex();
    this.version = version;
    this.finetunes = finetunes;
  } 
}

@public
collection Model {
  id: string;
  name: string;
  basemodel: string;
  version: string;
  $pk: string;
  
  finetunes: FineTunes[];
  
  @index(name, version);

  constructor (id: string, name: string, basemodel: string, version: string, finetunes: FineTunes[]) {
    this.id = id;
    this.$pk = ctx.publicKey.toHex();
    this.account = account;
    this.basemodel = basemodel;
    this.message = message;
    this.timestamp = timestamp;
  }
}
`

const PRIVATE_KEY = process.env.PRIVATE_KEY ?? ''

async function load() {
    const db = new Polybase({
        baseURL: `${process.env.REACT_APP_API_URL}/v0`,
        signer: async (data) => {
            const wallet = Wallet.fromPrivateKey(Buffer.from(PRIVATE_KEY, 'hex'))
            return { h: 'eth-personal-sign', sig: ethPersonalSign(wallet.getPrivateKey(), data) }
        },
    })

    if (!PRIVATE_KEY) {
        throw new Error('No private key provided')
    }

    await db.applySchema(schema, 'ai.repo')

    return 'Schema loaded'
}

load()
    .then(console.log)
    .catch(console.error)

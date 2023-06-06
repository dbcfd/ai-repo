import { Polybase } from '@polybase/client'
import Wallet from 'ethereumjs-wallet'
import { ethPersonalSign } from '@polybase/eth'

// PK, need to establish a PK so we can control updates

const schema = `
@public
collection User {
  id: string; 
  name?: string;
  @delegate
  publicKey: PublicKey;
  apikey: string;

  constructor(id: string, apikey: string, name?: string) {
    this.id = id;
    this.publicKey = ctx.publicKey;
    this.apikey = apikey;
  }

  setProfile(name: string) {
    if (this.$pk != ctx.publicKey.toHex()) {
      throw error ('invalid owner');
    }
    this.name = name;
  }
  
  withApiKey(apikey: string) {
    this.apikey = apikey
  }
}

@public Version {
  id: string;
  major: number;
  minor: number;
  patch: number;
  preRelease?: string;
  build?: string;
  
  constructor(major: number, minor: number: patch: number, preRelease?: string, build?: string) {
    this.id = major + '.' + minor + '.' + patch
    if(preRelease) {
      this.id = this.id + '-' + preRelease
    }
    if(build) {
      this.id = this.id + '+' + build
    }
    this.major = major;
    this.minor = minor;
    this.patch = patch;
    this.preRelease = preRelease;
    this.build = build;
  }
}

@public
collection FineTuning {
  id: string;
  previous?: string;
  version: Version;
  description: string;
  tags: string[];
  finetunes: string[];
  
  @delegate
  owner: User;
  
  @index(description, version);
  
  constructor(owner: User, id: string, previous?: string, version: Version, description: string, tags: string[], finetunes: string[]) {
    this.owner = owner;
    this.id = id;
    this.previous = previous;
    this.version = version;
    this.description = description;
    this.tags = tags;
    this.finetunes = finetunes;
  }
}

@public
collection Model {
  id: string;
  name: string;
  basemodel: string;
  previous?: Model;
  version: Version;
  
  finetunes: FineTuning[];
  @delegate
  owner: User
  
  @index(owner, name, version);
  @index(owner, basemodel);

  constructor (owner: User, id: string, name: string, basemodel: string, previous?: Model, version: Version, finetunes: FineTuning[]) {
    this.id = id;
    this.name = name;
    this.basemodel = basemodel;
    this.previous = previous;
    this.version = version;
    this.finetues = finetunes;
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

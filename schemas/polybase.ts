const { Polybase } = require('@polybase/client')
const Wallet = require('ethereumjs-wallet').default
const { ethPersonalSign } = require('@polybase/eth')
require('dotenv').config()

const schema = `
@public 
collection Version {
  id: string;
  major: number;
  minor: number;
  patch: number;
  preRelease?: string;
  build?: string;
  
  constructor(major: number, minor: number, patch: number, preRelease?: string, build?: string) {
    this.id = major + '.' + minor + '.' + patch;
    if (preRelease) {
      this.id = this.id + '-' + preRelease;
    }
    if (build) {
      this.id = this.id + '+' + build;
    }
    this.major = major;
    this.minor = minor;
    this.patch = patch;
    this.preRelease = preRelease;
    this.build = build;
  }
}

@public
collection User {
  id: string; 
  name?: string;
  @delegate
  publicKey: PublicKey;
  pvkey: string;
  apikey: string;

  constructor(id: string, pvkey: string, apikey: string) {
    this.id = id;
    this.publicKey = ctx.publicKey;
    this.apikey = apikey;
    this.pvkey = pvkey;
  }

  setProfile(name: string) {
    if (this.publicKey != ctx.publicKey.toHex()) {
      throw error ('invalid owner');
    }
    this.name = name;
  }
    
  withApiKey(apikey: string) {
    this.apikey = apikey;
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
  owner: User;
  
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
`;

async function load(privateKey: string, polybaseNamespace: string) {
  if (!privateKey) {
    throw new Error('No private key provided')
  }
  if (!polybaseNamespace) {
    throw new Error('Missing Polybase namespace')
  }
  
  const db = new Polybase({
    defaultNamespace: polybaseNamespace,
    signer: async (data: any) => {
      const wallet = Wallet.fromPrivateKey(Buffer.from(privateKey, 'hex'))
      return { h: 'eth-personal-sign', sig: ethPersonalSign(wallet.getPrivateKey(), data) }
    },
  })

  await db.applySchema(schema, 'ai.repo')

  return 'Schema loaded'
}

const PRIVATE_KEY = process.env.PRIVATE_KEY ?? ''
const POLYBASE_NAMESPACE = process.env.NEXT_PUBLIC_POLYBASE_DEFAULT_NAMESPACE ?? ''

load(PRIVATE_KEY, POLYBASE_NAMESPACE)
  .then(console.log)
  .catch(console.error)


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

  @index(major, minor, patch);

  
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
  apiKey: string;

  constructor(id: string, apiKey: string, name?: string) {
    this.id = id;
    this.publicKey = ctx.publicKey;
    this.apiKey = apiKey;
  }
  
  setApiKey(apiKey: string) {
    if (this.publicKey != ctx.publicKey.toHex()) {
      throw error ('invalid owner');
    }
    this.apiKey = apiKey;
  }

  setProfile(name: string) {
    if (this.publicKey != ctx.publicKey.toHex()) {
      throw error ('invalid owner');
    }
    this.name = name;
  }
}

@public
collection FineTuningCommits {
  id: string;
  commitLog: string;
  version: Version;
  
  @delegate
  owner: User;
  
  @index(version);
  @index(owner);
  @index(commitLog, version);
  @index(owner, [version, desc]);
  
  constructor(owner: User, id: string, commitLog: string, version: Version) {
    this.owner = owner;
    this.id = id;
    this.commitLog = commitLog;
    this.version = version;
  }
}

@public
collection AIModelCommits {
  id: string;
  commitLog: string;
  version: Version;
  
  fineTuning: FineTuningCommits[];

  @delegate
  owner: User;
  
  @index(owner);
  @index(version);

  @index(owner, commitLog, version);
  @index(owner, [version, desc]);

  constructor (owner: User, id: string, commitLog: string, version: Version, fineTuning: FineTuningCommits[]) {
    this.id = id;
    this.name = name;
    this.owner = owner;
    this.commitLog = commitLog;
    this.version = version;
    this.fineTuning = fineTuning;
  }
}
`

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

  await db.applySchema(schema)

  return 'Schema loaded'
}

const PRIVATE_KEY = process.env.PRIVATE_KEY ?? ''
const POLYBASE_NAMESPACE = process.env.NEXT_PUBLIC_POLYBASE_DEFAULT_NAMESPACE ?? ''

load(PRIVATE_KEY, POLYBASE_NAMESPACE)
  .then(console.log)
  .catch(console.error)
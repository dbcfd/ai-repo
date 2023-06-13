export const schema = `
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
  privateKey: string;
  apiKey: string;

  constructor(id: string, privateKey: string, apikey: string, name?: string) {
    this.id = id;
    this.publicKey = ctx.publicKey;
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
  
  @index(commitLog, version);
  
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
  
  @index(owner, commitLog, version);

  constructor (owner: User, id: string, commitLog: string, version: Version, fineTuning: FineTuningCommits[]) {
    this.id = id;
    this.name = name;
    this.commitLog = commitLog;
    this.version = version;
    this.fineTuning = fineTuning;
  }
}
`;


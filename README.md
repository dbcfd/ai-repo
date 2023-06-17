# AI.repo
AI fine tuning and model repository.

Features
 * Ability to create open or proprietary AI model fine tunes, versioned through changes
 * Ability to build off of open AI model fine tunes
 * Ability to train models based on fine tunes, versioned through training via fine tuning
 * Ability to build off of open AI models and their fine tunes
 * Ability to expose a AI prompt/response sandground via ENS
 * Ability to discover open fine tunes and models via ceramic and s3.xyz

## Getting Started

### Env vars

Copy .env.sample to .env.local

### Generate Models
Install `timeout` if not present

    brew install coreutils

Run `create_models.sh` to generate models

    ./create_models.sh

#### You can also run ceramic without wheel (not recommended)

Install ceramic:
- npm install --location=global @ceramicnetwork/cli
- npm install --location=global @composedb/cli

Generate a DID: `export DID_PRIVATE_KEY=$(composedb did:generate-private-key)`

Run the daemon: `CERAMIC_ENABLE_EXPERIMENTAL_COMPOSE_DB=true npx @ceramicnetwork/cli daemon --network inmemory`

### Run Graphiql Server (Optional)

To run a graphiql server for query exploration, you will need to add to you environment the appropriate ceramic variables

    cd wheel
    source gen/composedb.env
    ./composedb graphql:server --graphiql --port=5005 ../generated/runtime.json

### Run Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
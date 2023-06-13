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

### Setup Ceramic
Follow the instructions for setting up [wheel](https://github.com/ceramicstudio/wheel). When running wheel, choose to 
install ceramic and composedb. Wheel will setup into a project directory, that we will call <wheel directory>

### Generate Models
Run `create_models.sh` to generate models

    ./create_models.sh <wheel_directory>

### Run Graphiql Server (Optional)

To run a graphiql server for query exploration, you will need to add to you environment the appropriate ceramic variables

    cd <wheel directory>
    source composedb.env

Now you can run the graphiql server

    cd <wheel directory>


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
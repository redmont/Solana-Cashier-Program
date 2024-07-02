# BRAWL3RS

## Prerequisites

### Run front-end only

* NodeJS
* pnpm

### Run entire project

* NodeJS
* pnpm
* [Docker](https://www.docker.com/)
* [AWS CLI (v2)](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
* [NestJS CLI](https://docs.nestjs.com/cli/overview)

    ```sh
    pnpm i -g @nestjs/cli
    ```

* [NATS CLI](https://github.com/nats-io/natscli)

    ```sh
    curl -sf https://binaries.nats.dev/nats-io/natscli/nats@latest | sh
    ```

## Run front-end only

Create .env file:

```sh
cp apps/ui/.env.example apps/ui/.env
```

Update the .env file and set the server URL to the dev server:

```
NEXT_PUBLIC_SERVER_URL=https://ui-gateway.dev.brawlers.bltzr.gg:3333
```

Run the UI:

```sh
pnpm install
cd apps/ui
pnpm dev
```

## Run entire project project

Run infrastructure:

```sh
./run-infra.sh
```

Run project:

```sh
pnpm install
pnpm dev
```

Run with debug of a particular service:

```sh
pnpm dev -F '!core'
```

```sh
cd apps/core
pnpm start:debug
```

### Set up the series

You need to set up the series before you can start the game.

Configure the mock server:

```sh
curl --location 'http://localhost:8080/admin/game-server-configs' \
--header 'Content-Type: application/json' \
--data '{
    "codeName": "mock001",
    "streamUrl": "https://viewer.millicast.com?streamId=WBYdQB/brawlers-dev-2&controls=false&showLabels=false"
}'
```

Create fighter profiles:

```sh
curl --location 'http://localhost:8080/admin/fighter-profiles' \
--header 'Content-Type: application/json' \
--data '{
    "codeName": "pepe",
    "displayName": "Pepe",
    "ticker": "PEPE",
    "imagePath": "",
    "model": {
        "head": "H_PepeA",
        "torso": "T_PepeA",
        "legs": "L_PepeA"
    }
}'

curl --location 'http://localhost:8080/admin/fighter-profiles' \
--header 'Content-Type: application/json' \
--data '{
    "codeName": "doge",
    "displayName": "Doge",
    "ticker": "DOGE",
    "imagePath": "",
    "model": {
        "head": "H_DogeA",
        "torso": "T_DogeA",
        "legs": "L_DogeA"
    }
}'
```

Create the series:

```sh
curl --location 'http://localhost:8080/admin/series' \
--header 'Content-Type: application/json' \
--data '{
    "codeName": "frogs-vs-dogs",
    "displayName": "Frogs vs Dogs",
    "betPlacementTime": 20,
    "fighterProfiles": ["pepe", "doge"],
    "level": "level001",
    "fightType": "MMA"
}'
```

Update the roster:

```sh
curl -X PATCH --location 'http://localhost:8080/admin/roster' \
--header 'Content-Type: application/json' \
--data '{
    "scheduleType": "linear",
    "series": ["frogs-vs-dogs"]
}'
```

Create a 7 day tournament:

```sh
curl --location 'http://localhost:8080/admin/tournaments' \
--header 'Content-Type: application/json' \
--data '{
  "codeName": "chicken-dinner",
  "displayName": "Chicken dinner",
  "startDate": "'"$(date -u +"%Y-%m-%dT%H:%M:%SZ")"'",
  "rounds": 7,
  "prizes": [
    {
      "title": "$300",
      "description": "Winner!"
    },
    {
      "title": "$200",
      "description": "Runner-up!"
    },
    {
      "title": "$100",
      "description": "Third place!"
    }
  ]
}'
```

### Run the mock server

```sh
./mock-ws-client.js
```

### Run roster of 3 series

```sh
curl --location 'http://localhost:8080/admin/series' \
--header 'Content-Type: application/json' \
--data '{
    "codeName": "fightera-vs-fighterb",
    "displayName": "Fighter A vs Fighter B",
    "betPlacementTime": 20,
    "fighters": [
        {
            "codeName": "fighter-a",
            "displayName": "Fighter A",
            "ticker": "PEPE",
            "imagePath": "",
            "model": {
                "head": "H_PepeA",
                "torso": "T_PepeA",
                "legs": "L_PepeA"
            }
        },
        {
            "codeName": "fighter-b",
            "displayName": "Fighter B",
            "ticker": "DOGE",
            "imagePath": "",
            "model": {
                "head": "H_DogeA",
                "torso": "T_DogeA",
                "legs": "L_DogeA"
            }
        }
    ],
    "level": "level001",
    "fightType": "MMA"
}'

curl --location 'http://localhost:8080/admin/series' \
--header 'Content-Type: application/json' \
--data '{
    "codeName": "fighterc-vs-fighterd",
    "displayName": "Fighter C vs Fighter D",
    "betPlacementTime": 20,
    "fighters": [
        {
            "codeName": "fighter-c",
            "displayName": "Fighter C",
            "ticker": "PEPE",
            "imagePath": "",
            "model": {
                "head": "H_PepeA",
                "torso": "T_PepeA",
                "legs": "L_PepeA"
            }
        },
        {
            "codeName": "fighter-d",
            "displayName": "Fighter D",
            "ticker": "DOGE",
            "imagePath": "",
            "model": {
                "head": "H_DogeA",
                "torso": "T_DogeA",
                "legs": "L_DogeA"
            }
        }
    ],
    "level": "level001",
    "fightType": "MMA"
}'

curl -X PUT --location 'http://localhost:8080/admin/roster' \
--header 'Content-Type: application/json' \
--data '{
    "scheduleType": "linear",
    "series": ["frogs-vs-dogs", "fightera-vs-fighterb", "fighterc-vs-fighterd"]
}'
```

## Sending price oracle price updates

You can publish mock price oracle messages to the NATS server by running the following command (_NATS CLI is required_):

```sh
nats pub oracleIndexer.price.2.pyth.pyth.doge.usd '{"symbol":{"base":"PEPE"},"timestamp":'$(date +%s)'000,"price":1.234,"exchange":"binance","provider":"cc"}'
```

## GitHub Actions

To test the GH actions locally, use [Act](https://nektosact.com/).

```sh
act pull_request --container-architecture linux/amd64 -s NPM_TOKEN=(your token)
```

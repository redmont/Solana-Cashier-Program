# BRAWL3RS

## Prerequisites

### Run front-end only

- NodeJS
- pnpm

### Run entire project

- NodeJS
- pnpm
- [Docker](https://www.docker.com/)
- [AWS CLI (v2)](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

> [!IMPORTANT]
> You must have AWS credentials set up - dummy ones will work fine, as running the project locally does not require any AWS services.
>
> ```sh
> cat << AWSFILE > ~/.aws/credentials
> [default]
> aws_access_key_id=dummy
> aws_secret_access_key=dummy
> region=ap-southeast-1
> AWSFILE
> ```

- [NestJS CLI](https://docs.nestjs.com/cli/overview)

  ```sh
  pnpm i -g @nestjs/cli
  ```

- [NATS CLI](https://github.com/nats-io/natscli)

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

## Run entire project

Create .env files:

```sh
cp apps/admin/.env.example apps/admin/.env
cp apps/ui/.env.example apps/ui/.env
cp apps/cashier/.env.example apps/cashier/.env
cp apps/core/.env.example apps/core/.env
cp apps/ui-gateway/.env.example apps/ui-gateway/.env
```

Run infrastructure:

```sh
./run-infra.sh
```

Set up oracle indexer NATS subject:

```sh
nats --server localhost:4222 stream add oracleIndexer --subjects='oracleIndexer.>' --retention='workq' --max-msgs=-1 --max-bytes=-1 --max-
age='1h' --storage='file' --discard='old' --replicas=1 --defaults
```

Run project:

```sh
# Install dependencies
pnpm install
# Build packages
pnpm build
# Run
pnpm dev
```

### (Optional) Run with debug of a particular service

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
    "streamId": "brawlers_dev_1"
}'

curl -X PATCH --location 'http://localhost:8080/admin/game-server-configs/mock001' \
--header 'Content-Type: application/json' \
--data '{
    "streamId": "brawlers_dev_1",
    "enabled": true
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
    "enabled": true,
    "showOnRoster": true,
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
    "enabled": true,
    "showOnRoster": true,
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

#### (Optional) Add daily claims

```sh
curl -X PUT --location 'http://localhost:8080/admin/daily-claim-amounts' \
--header 'Content-Type: application/json' \
--data '{
    "dailyClaimAmounts": [7500000, 12500000, 15000000, 17250000, 18250000, 18500000]
}'
```

#### (Optional) Set up tournament

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

### (Optional) Run roster of 3 series

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

# Brawlers

## Prerequisites

```sh
pnpm i -g @nestjs/cli
```

## Run project

Run infrastructure

```sh
./run-ddb.sh
```

Run project:

```sh
pnpm install
pnpm dev
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

Create the series:

```
interface CreateSeriesRequest {
  codeName: string;
  displayName: string;
  betPlacementTime: number;
  fighters: {
    codeName: string;
    displayName: string;
    ticker: string;
    model: {
      head: string;
      torso: string;
      legs: string;
    };
  }[];
  level: string;
}
```

```sh
curl --location 'http://localhost:8080/admin/series' \
--header 'Content-Type: application/json' \
--data '{
    "codeName": "frogs-vs-dogs",
    "displayName": "Frogs vs Dogs",
    "betPlacementTime": 20,
    "fighters": [
        {
            "codeName": "pepe",
            "displayName": "Pepe",
            "ticker": "PEPE",
            "model": {
                "head": "H_PepeA",
                "torso": "T_PepeA",
                "legs": "L_PepeA"
            }
        },
        {
            "codeName": "doge",
            "displayName": "Doge",
            "ticker": "DOGE",
            "model": {
                "head": "H_DogeA",
                "torso": "T_DogeA",
                "legs": "L_DogeA"
            }
        }
    ],
    "level": "level001"
}'
```

### Run the mock server

```sh
./mock-ws-client.js
```

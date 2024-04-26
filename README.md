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

```sh
curl --location 'http://localhost:8080/admin/series' \
--header 'Content-Type: application/json' \
--data '{
    "codeName": "frogs-vs-dogs-1",
    "displayName": "Frogs vs Dogs"
}'
```

Run the series:

```sh
curl --location 'http://localhost:8080/admin/series/run' \
--header 'Content-Type: application/json' \
--data '{
    "codeName": "frogs-vs-dogs-1"
}'
```

### Run the mock server

```sh
./mock-ws-client.js
```

## WebSocket

## Build Docker images

```sh
docker build --platform linux/amd64 . --target ui-gateway --tag brawl-ui-gateway-cr-dev
docker tag brawl-ui-gateway-cr-dev:latest 875278257729.dkr.ecr.ap-southeast-1.amazonaws.com/brawl-ui-gateway-cr-dev:latest
docker push 875278257729.dkr.ecr.ap-southeast-1.amazonaws.com/brawl-ui-gateway-cr-dev:latest

docker build --platform linux/amd64 . --target core --tag brawl-core-cr-dev
docker tag brawl-core-cr-dev:latest 875278257729.dkr.ecr.ap-southeast-1.amazonaws.com/brawl-core-cr-dev:latest
docker push 875278257729.dkr.ecr.ap-southeast-1.amazonaws.com/brawl-core-cr-dev:latest

docker build --platform linux/amd64 . --target cashier --tag brawl-cashier-cr-dev
docker tag brawl-cashier-cr-dev:latest 875278257729.dkr.ecr.ap-southeast-1.amazonaws.com/brawl-cashier-cr-dev:latest
docker push 875278257729.dkr.ecr.ap-southeast-1.amazonaws.com/brawl-cashier-cr-dev:latest
```

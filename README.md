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

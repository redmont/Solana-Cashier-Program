# Brawlers

## Prerequisites

```sh
pnpm i -g @nestjs/cli
```

## Run project

Run Redis:

```sh
docker run --name brawlers-redis -p 4515:6379 -d redis
```

Run project:

```sh
pnpm install
pnpm dev
```

## Build Docker images

```sh
docker build --platform linux/amd64 . --target ui-gateway --tag brawl-ui-gateway-cr-dev
docker tag brawl-ui-gateway-cr-dev:latest 875278257729.dkr.ecr.ap-southeast-1.amazonaws.com/brawl-ui-gateway-cr-dev:latest
docker push 875278257729.dkr.ecr.ap-southeast-1.amazonaws.com/brawl-ui-gateway-cr-dev:latest
```

```sh
docker build --platform linux/amd64 . --target match-manager --tag brawl-match-manager-cr-dev
docker tag brawl-match-manager-cr-dev:latest 875278257729.dkr.ecr.ap-southeast-1.amazonaws.com/brawl-match-manager-cr-dev:latest
docker push 875278257729.dkr.ecr.ap-southeast-1.amazonaws.com/brawl-match-manager-cr-dev:latest
```

```sh
docker build --platform linux/amd64 . --target cashier --tag brawl-cashier-cr-dev
docker tag brawl-cashier-cr-dev:latest 875278257729.dkr.ecr.ap-southeast-1.amazonaws.com/brawl-cashier-cr-dev:latest
docker push 875278257729.dkr.ecr.ap-southeast-1.amazonaws.com/brawl-cashier-cr-dev:latest
```

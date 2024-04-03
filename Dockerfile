FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN npm i -g @nestjs/cli

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build
RUN pnpm deploy --filter=ui-gateway --prod /prod/ui-gateway
RUN cp -r apps/ui-gateway/dist/ /prod/ui-gateway/
RUN pnpm deploy --filter=match-manager --prod /prod/match-manager
RUN cp -r apps/match-manager/dist/ /prod/match-manager/
RUN pnpm deploy --filter=cashier --prod /prod/cashier
RUN cp -r apps/cashier/dist/ /prod/cashier/

FROM base AS ui-gateway
COPY --from=build /prod/ui-gateway /prod/ui-gateway
WORKDIR /prod/ui-gateway
EXPOSE 3333
CMD ["node", "dist/main.js"]

FROM base AS match-manager
COPY --from=build /prod/match-manager /prod/match-manager
WORKDIR /prod/match-manager
CMD ["node", "dist/main.js"]

FROM base AS cashier
COPY --from=build /prod/cashier /prod/cashier
WORKDIR /prod/cashier
CMD ["node", "dist/main.js"]

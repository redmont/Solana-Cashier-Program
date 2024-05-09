FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN npm i -g @nestjs/cli

FROM base AS build
ARG NPM_TOKEN
# Set up npmjs authentication
RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >~/.npmrc
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN find . -name '.env*' -exec rm -f {} \;
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build --filter=!web --filter=!docs --filter=!ui --filter=!admin
RUN pnpm deploy --filter=ui-gateway --prod /prod/ui-gateway
RUN cp -r apps/ui-gateway/dist/ /prod/ui-gateway/
RUN pnpm deploy --filter=core --prod /prod/core
RUN cp -r apps/core/dist/ /prod/core/
RUN pnpm deploy --filter=cashier --prod /prod/cashier
RUN cp -r apps/cashier/dist/ /prod/cashier/

FROM base AS ui-gateway
COPY --from=build /prod/ui-gateway /prod/ui-gateway
WORKDIR /prod/ui-gateway
EXPOSE 3333
CMD ["node", "dist/main.js"]

FROM base AS core
COPY --from=build /prod/core /prod/core
WORKDIR /prod/core
CMD ["node", "dist/main.js"]

FROM base AS cashier
COPY --from=build /prod/cashier /prod/cashier
WORKDIR /prod/cashier
CMD ["node", "dist/main.js"]

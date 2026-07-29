FROM node:22-alpine AS base

WORKDIR /app
COPY package.json .
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .

FROM base AS dev
EXPOSE 3000
CMD ["pnpm", "dev"]

FROM base AS build
RUN pnpm build

FROM node:22-alpine AS prod
WORKDIR /app
COPY --from=build /app/.next .next
COPY --from=build /app/public public
COPY --from=build /app/package.json .
EXPOSE 3000
CMD ["pnpm", "start"]

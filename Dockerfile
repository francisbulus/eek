FROM node:14-slim as build
RUN apt-get update
RUN apt-get install -y openssl
RUN npm install -g npm@8
WORKDIR /src/app

COPY package.json package-lock.json .
RUN npm install

COPY tsconfig.json .
COPY pages/ pages/
COPY test/ test/
COPY src/ src/

ENV PRISMA_BINARY_TARGET='["linux-musl"]'

RUN npm run prisma:generate:seated

RUN npm run build

# Cleanup
RUN npx clean-modules

# Using multi-staged builds to decrease image size.
FROM node:14-alpine
WORKDIR /src/app
COPY --from=build src/app/node_modules/ node_modules/
COPY --from=build src/app/package.json .
COPY --from=build src/app/build/ build/
COPY datadog.yaml .

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Automatically leverage output traces to reduce image size 
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --chown=nextjs:nodejs --from=build src/app/.next .next

USER nextjs

EXPOSE ${port}

ENV PORT ${port}
CMD ["npm", "start"]

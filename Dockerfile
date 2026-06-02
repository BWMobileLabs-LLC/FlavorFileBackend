FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY knexfile.mjs ./
COPY migrations ./migrations
COPY src ./src
COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]

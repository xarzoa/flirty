FROM oven/bun:1-slim

WORKDIR /app

COPY package.json bun.lockb ./

RUN bun install --production

COPY . .

ARG EnvironmentVariable

CMD ["bun", "start"]

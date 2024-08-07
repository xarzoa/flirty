FROM oven/bun:1

WORKDIR /app

COPY package.json ./
COPY bun.lockb ./

RUN bun install

COPY . .

ARG EnvironmentVariable

CMD ["bun" , "start"]

FROM oven/bun:1

WORKDIR /app

COPY package*.json ./

RUN bun install

COPY . .

ARG EnvironmentVariable

EXPOSE 3000

CMD ["bun" , "start"]

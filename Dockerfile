FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG DATABASE_URL=postgresql://postgres:postgres@postgres:5432/estatemint?schema=public
ENV DATABASE_URL=$DATABASE_URL

RUN npm run prisma:generate

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/src/main.js"]

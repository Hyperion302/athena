FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./
COPY ts*.json ./
COPY src/ src/
COPY configuration.json ./

RUN npm install

RUN npm run build

ENV NODE_ENV production

CMD node dist/index.js
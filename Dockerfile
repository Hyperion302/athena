FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./
COPY ts*.json ./
COPY src/ src/
COPY configuration.json ./
COPY credentials.json ./

RUN npm install

RUN npm run build

CMD node dist/index.js
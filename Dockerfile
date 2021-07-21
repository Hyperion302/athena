FROM node:16-alpine

ENV HOME /usr/src/
ENV DB /usr/db/
WORKDIR $HOME

# Copy files needed for install

COPY package.json $HOME
COPY yarn.lock $HOME
COPY .yarnrc.yml $HOME
# Needed because .yarnrc.yml points to a release file
COPY .yarn $HOME/.yarn/
COPY common/package.json $HOME/common/
COPY backend/package.json $HOME/backend/

# Install deps

RUN yarn

# Copy the rest

COPY . $HOME

# Build common

WORKDIR $HOME/common
RUN yarn tsc

# Build backend

WORKDIR $HOME/backend
RUN yarn build

# API port

EXPOSE 8081

# Public vars

ENV NODE_ENV production
ENV CLIENT_ID 431986820612620310
ENV MIGRATE true
ENV SQL_PATH $DB/prod.db
ENV ROOT_URL https://athna.xyz

ENV PORT 8081

# DB vol

VOLUME $DB

# Start

CMD yarn start

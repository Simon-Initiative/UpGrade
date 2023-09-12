FROM node:16.10.0-alpine

ENV NEW_RELIC_NO_CONFIG_FILE=true
ENV NR_NATIVE_METRICS_NO_BUILD=true

# Create app directory
WORKDIR /usr/src/app

COPY ./../types /usr/src/types

RUN cd /usr/src/types && npm ci

COPY . .

WORKDIR /usr/src/app/frontend

RUN npm ci
ENV NODE_OPTIONS=--max_old_space_size=4096
RUN ["npm", "run", "build:production"]

EXPOSE 4200
CMD ["npm", "run", "server"]

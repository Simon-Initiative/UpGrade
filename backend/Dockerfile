FROM node:16.15.0-alpine

ENV NEW_RELIC_NO_CONFIG_FILE=true
ENV NR_NATIVE_METRICS_NO_BUILD=true

# Create app directory
WORKDIR /usr/src/app

COPY ./../types ./types

RUN cd /usr/src/app/types && npm ci

COPY . .

WORKDIR /usr/src/app/backend

RUN cp -R ../types packages/Upgrade
RUN ["npm", "run", "install:all"]
RUN ["npm", "run", "build:upgrade"]

RUN chown -R node:node /usr/src/app

EXPOSE 3030
# CMD ["npm", "run", "--silent", "production:upgrade"]
CMD ["npm", "run", "production:upgrade"]

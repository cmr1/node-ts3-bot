FROM node:6-slim

LABEL maintainer "Charlie McClung <charlie.mcclung@autodesk.com>"

ENV BOT_DIR=/bot

RUN mkdir -p $BOT_DIR

WORKDIR $BOT_DIR

COPY ./package.json .

RUN npm install

COPY ./ ./

CMD [ "npm", "start" ]
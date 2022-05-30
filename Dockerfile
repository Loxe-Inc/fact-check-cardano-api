FROM node:lts-bullseye-slim
RUN mkdir /fact-check
COPY *.js *.json /fact-check/
WORKDIR /fact-check
RUN npm i
COPY src /fact-check/src

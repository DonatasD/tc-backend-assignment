FROM node:20-alpine
RUN mkdir /home/node/app/
WORKDIR /home/node/app
RUN npm install
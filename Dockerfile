FROM node:15-alpine

COPY /frontend/package*.json ./frontend/
COPY /server/package*.json ./server/

COPY . /app/

WORKDIR /app

RUN cd /app/server && npm install && cd /app/frontend && npm install && npm run build

WORKDIR server
USER node
CMD [ "node", "server.js" ]
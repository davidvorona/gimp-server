FROM node:14

COPY . .
RUN npm ci

ENTRYPOINT npm start

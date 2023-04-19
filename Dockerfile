FROM node:16-alpine

ENV OPENAI_API_KEY=""
ENV AUTHORIZATION_KEY=""
ENV SERVER_PORT=3666

WORKDIR /app

COPY . .

RUN npm i typescript -g && npm ci && tsc

CMD [ "npm", "run", "start" ]
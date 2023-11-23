FROM node:20

WORKDIR /app

COPY package*.json ./
COPY prisma ./

RUN npm install

EXPOSE 7272

CMD [ "npm","run","dev" ]
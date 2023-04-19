FROM node:16

WORKDIR /nwallet/backend

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 8000

CMD ["node", "index.js"]
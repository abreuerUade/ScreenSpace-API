FROM node:14-alpine

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3500

CMD ["npm", "start"]

FROM node:18-alpine

WORKDIR /app

COPY . .

# RUN rm -rf node_modules
RUN npm install

EXPOSE 3500

CMD ["npm", "start"]

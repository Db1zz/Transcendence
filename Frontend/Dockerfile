FROM node:17-alpine

WORKDIR /app

ENV PATH /app_react/node_modules/.bin:$PATH

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
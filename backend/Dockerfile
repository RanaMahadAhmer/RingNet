FROM node:20-slim

WORKDIR /usr/src/app


COPY package*.json ./


RUN npm install --omit=dev


COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start"]

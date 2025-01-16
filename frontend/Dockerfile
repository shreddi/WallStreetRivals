# frontend/Dockerfile
FROM node:20-alpine

RUN mkdir -p /app
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev"]
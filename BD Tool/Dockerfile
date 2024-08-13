# Stage 1: Build
FROM node:20.16.0 AS builder
WORKDIR /app
COPY package*.json yarn.lock ./
RUN npm install -g yarn --force
RUN yarn install
COPY . .
RUN yarn build
# Stage 2: Serve
FROM node:20.16.0   
WORKDIR /app
COPY --from=builder /app ./
RUN apt-get update && apt-get install -y iputils-ping  # Install ping
EXPOSE 5173
CMD ["yarn", "dev"]

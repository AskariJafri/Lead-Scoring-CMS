# Stage 1: Build
FROM node:20.14.0 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM node:20.14.0
WORKDIR /app
COPY --from=builder /app .
EXPOSE 5173
CMD ["npm", "run", "dev"]

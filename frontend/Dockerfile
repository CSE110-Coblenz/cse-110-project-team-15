FROM node:20 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

# Copy configuration files
COPY tsconfig.json index.html ./

# Copy source code
COPY frontend ./frontend
COPY public ./public

# Build the application
RUN npm run build

FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
